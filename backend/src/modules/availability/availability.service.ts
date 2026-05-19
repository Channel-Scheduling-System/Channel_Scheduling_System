import { Temporal } from 'temporal-polyfill';
import { IUserService } from '../users/user.service.js';
import { IAvailabilityRepository } from './availability.repository.js';
import {
    BlockedTime,
    CreateBlockedTimeData,
    CreateDayOffInput,
    CreatePeriodOffInput,
    CreateRecurringTimeOffInput,
    CreateTimeOffInput,
    CreateWorkingHoursInput,
    WorkingHourInput,
} from './availability.types.js';
import { AVAILABILITY_ERRORS } from '../../shared/constants/messages.js';
import {
    ConflictError,
    ForbiddenError,
    NotFoundError,
} from '../../shared/errors/domain.error.js';
import {
    mapToCreateDayOffData,
    mapToCreatePeriodOffData,
    mapToCreateTimeOffData,
    mapToCreateWorkingHoursData,
} from './availability.mapper.js';
import { BlockedTimeOverlapValidator } from './blocked-time-overlap.validator.js';
import { AuthContext } from '../../shared/utils/request-parser.util.js';

export interface IAvailabilityService {
    addWorkingHours(input: CreateWorkingHoursInput): Promise<void>;
    addTimeOff(input: CreateTimeOffInput): Promise<void>;
    addDayOff(input: CreateDayOffInput): Promise<void>;
    addPeriodOff(input: CreatePeriodOffInput): Promise<void>;
    delete(id: number, auth?: AuthContext): Promise<void>;
}

export class AvailabilityService implements IAvailabilityService {
    private readonly overlapValidator = new BlockedTimeOverlapValidator();

    constructor(
        private readonly availabilityRepo: IAvailabilityRepository,
        private readonly userService: IUserService,
    ) {}

    async addWorkingHours(input: CreateWorkingHoursInput): Promise<void> {
        await this.ensureWorkerExists(input.workerId);
        this.checkUniqueWorkingDays(input.workingHours);
        // Eliminar horarios anteriores y agregar los nuevos
        await this.availabilityRepo.deleteWorkingHoursByWorkerId(
            input.workerId,
        );
        const workingHoursData = mapToCreateWorkingHoursData(input);
        await this.availabilityRepo.createWorkingHourBulk(workingHoursData);
    }

    async addTimeOff(input: CreateTimeOffInput): Promise<void> {
        await this.ensureWorkerExists(input.workerId);
        const timeOff = mapToCreateTimeOffData(input);

        if (input.type === 'RECURRING') {
            await this.checkOverlappingRecurring(input);
        } else {
            this.checkFutureDate(input.date);
            await this.checkOverlapping(timeOff);
        }

        await this.availabilityRepo.createBlockedTime(timeOff);
    }

    async addDayOff(input: CreateDayOffInput): Promise<void> {
        await this.ensureWorkerExists(input.workerId);
        this.checkFutureDate(input.date);
        const dayOff = mapToCreateDayOffData(input);
        await this.checkOverlapping(dayOff);
        await this.availabilityRepo.createBlockedTime(dayOff);
    }

    async addPeriodOff(input: CreatePeriodOffInput): Promise<void> {
        await this.ensureWorkerExists(input.workerId);
        this.checkFutureDate(input.startDate);
        this.checkFutureDate(input.endDate);
        const periodOff = mapToCreatePeriodOffData(input);
        await this.checkOverlapping(periodOff);
        await this.availabilityRepo.createBlockedTime(periodOff);
    }

    async delete(id: number, auth?: AuthContext): Promise<void> {
        const block = await this.getBlockedTimeOrFail(id);
        if (auth) this.validateOwnership(block, auth);
        await this.availabilityRepo.deleteBlockedTime(id);
    }

    private async getBlockedTimeOrFail(id: number): Promise<BlockedTime> {
        const blockedTime = await this.availabilityRepo.findBlockedTimeById(id);
        if (!blockedTime)
            throw new NotFoundError(AVAILABILITY_ERRORS.NOT_FOUND);
        return blockedTime;
    }

    // VALIDACIONES DE NEGOCIO Y PERMISOS
    //* -----------------------------

    private async ensureWorkerExists(workerId: number): Promise<void> {
        if (!(await this.userService.existsByIdAndRole(workerId, 'WORKER'))) {
            throw new NotFoundError(AVAILABILITY_ERRORS.WORKER_NOT_FOUND);
        }
    }

    private checkUniqueWorkingDays(workingHours: WorkingHourInput[]): void {
        const daysOfWeek = new Set<string>();
        for (const wh of workingHours) {
            if (daysOfWeek.has(wh.dayOfWeek)) {
                throw new ConflictError(
                    AVAILABILITY_ERRORS.DUPLICATE_DAYOFWEEK,
                );
            }
            daysOfWeek.add(wh.dayOfWeek);
        }
    }

    private checkFutureDate(date: string): void {
        const dayOffDate = Temporal.PlainDate.from(date);
        const today = Temporal.Now.plainDateISO();
        if (Temporal.PlainDate.compare(dayOffDate, today) < 0)
            throw new ConflictError(AVAILABILITY_ERRORS.DAY_OFF_IN_PAST);
    }

    private async checkOverlapping(
        block: CreateBlockedTimeData,
    ): Promise<void> {
        const blocks = await this.availabilityRepo.findAllBlockedTimes({
            workerId: block.workerId,
        });
        if (this.overlapValidator.overlaps(block, blocks)) {
            throw new ConflictError(AVAILABILITY_ERRORS.OVERLAPPING_DAY_OFF);
        }
    }

    private async checkOverlappingRecurring(
        block: CreateRecurringTimeOffInput,
    ): Promise<void> {
        const blocks = await this.availabilityRepo.findAllBlockedTimes({
            workerId: block.workerId,
        });
        if (this.overlapValidator.overlapsRecurring(block, blocks)) {
            throw new ConflictError(AVAILABILITY_ERRORS.OVERLAPPING_DAY_OFF);
        }
    }

    private validateOwnership(block: BlockedTime, auth: AuthContext): void {
        if (block.workerId !== auth.id) {
            throw new ForbiddenError(AVAILABILITY_ERRORS.OWNER_MISMATCH);
        }
    }
}

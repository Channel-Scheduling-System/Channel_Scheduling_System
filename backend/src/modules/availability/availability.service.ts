import { IUserService } from '../users/user.service.js';
import { IAvailabilityRepository } from './availability.repository.js';
import {
    AvailabilityWorkerFilter,
    AvailabilityWorkerResponse,
    BlockedTime,
    CreateDayOffInput,
    CreatePeriodOffInput,
    CreateTimeOffInput,
    CreateWorkingHoursInput,
} from './availability.types.js';
import { AVAILABILITY_ERRORS } from '../../shared/constants/messages.js';
import { NotFoundError } from '../../shared/errors/domain.error.js';
import {
    mapToCreateDayOffData,
    mapToCreatePeriodOffData,
    mapToCreateTimeOffData,
    mapToCreateWorkingHoursData,
} from './availability.mapper.js';
import { AvailabilityBusinessValidator } from './validators/availability-business.validator.js';
import { AvailabilityFiltersProcessor } from './utils/availability-filters.processor.js';
import { AuthContext } from '../../shared/utils/request-parser.util.js';

export interface IAvailabilityService {
    addWorkingHours(input: CreateWorkingHoursInput): Promise<void>;
    addTimeOff(input: CreateTimeOffInput): Promise<void>;
    addDayOff(input: CreateDayOffInput): Promise<void>;
    addPeriodOff(input: CreatePeriodOffInput): Promise<void>;
    getFullAvailability(
        filters: AvailabilityWorkerFilter,
        auth?: AuthContext,
    ): Promise<AvailabilityWorkerResponse>;
    delete(id: number, auth?: AuthContext): Promise<void>;
}

export class AvailabilityService implements IAvailabilityService {
    private readonly businessValidator: AvailabilityBusinessValidator;
    private readonly filtersProcessor: AvailabilityFiltersProcessor;

    constructor(
        private readonly availabilityRepo: IAvailabilityRepository,
        private readonly userService: IUserService,
    ) {
        this.businessValidator = new AvailabilityBusinessValidator(
            availabilityRepo,
            userService,
        );
        this.filtersProcessor = new AvailabilityFiltersProcessor(
            availabilityRepo,
        );
    }

    async addWorkingHours(input: CreateWorkingHoursInput): Promise<void> {
        await this.businessValidator.ensureWorkerExists(input.workerId);
        this.businessValidator.checkUniqueWorkingDays(input.workingHours);
        // Eliminar horarios anteriores y agregar los nuevos
        await this.availabilityRepo.deleteWorkingHoursByWorkerId(
            input.workerId,
        );
        const workingHoursData = mapToCreateWorkingHoursData(input);
        await this.availabilityRepo.createWorkingHourBulk(workingHoursData);
    }

    async addTimeOff(input: CreateTimeOffInput): Promise<void> {
        await this.businessValidator.ensureWorkerExists(input.workerId);
        const timeOff = mapToCreateTimeOffData(input);

        if (input.type === 'RECURRING') {
            await this.businessValidator.checkOverlappingRecurring(input);
        } else {
            this.businessValidator.checkFutureDate(input.date);
            await this.businessValidator.checkOverlapping(timeOff);
        }

        await this.availabilityRepo.createBlockedTime(timeOff);
    }

    async addDayOff(input: CreateDayOffInput): Promise<void> {
        await this.businessValidator.ensureWorkerExists(input.workerId);
        this.businessValidator.checkFutureDate(input.date);
        const dayOff = mapToCreateDayOffData(input);
        await this.businessValidator.checkOverlapping(dayOff);
        await this.availabilityRepo.createBlockedTime(dayOff);
    }

    async addPeriodOff(input: CreatePeriodOffInput): Promise<void> {
        await this.businessValidator.ensureWorkerExists(input.workerId);
        this.businessValidator.checkFutureDate(input.startDate);
        this.businessValidator.checkFutureDate(input.endDate);
        const periodOff = mapToCreatePeriodOffData(input);
        await this.businessValidator.checkOverlapping(periodOff);
        await this.availabilityRepo.createBlockedTime(periodOff);
    }

    async getFullAvailability(
        filters: AvailabilityWorkerFilter,
        auth?: AuthContext,
    ): Promise<AvailabilityWorkerResponse> {
        const workerId = filters.workerId;
        await this.businessValidator.ensureWorkerExists(workerId);
        if (auth) this.businessValidator.validateCanView(workerId, auth);

        return this.filtersProcessor.process(workerId, filters);
    }

    async delete(id: number, auth?: AuthContext): Promise<void> {
        const block = await this.getBlockedTimeOrFail(id);
        if (auth) this.businessValidator.validateOwnership(block, auth);
        await this.availabilityRepo.deleteBlockedTime(id);
    }

    private async getBlockedTimeOrFail(id: number): Promise<BlockedTime> {
        const blockedTime = await this.availabilityRepo.findBlockedTimeById(id);
        if (!blockedTime)
            throw new NotFoundError(AVAILABILITY_ERRORS.NOT_FOUND);
        return blockedTime;
    }
}

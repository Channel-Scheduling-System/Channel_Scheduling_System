import { IUserService } from '../users/user.service.js';
import { IAvailabilityRepository } from './availability.repository.js';
import {
    AvailabilityClientFilter,
    AvailabilityClientResponse,
    AvailabilityWorkerFilter,
    AvailabilityWorkerResponse,
    BlockedTime,
    CreateDayOffInput,
    CreatePeriodOffInput,
    CreateTimeOffInput,
    CreateWorkingHoursInput,
    Slot,
} from './availability.types.js';
import { AVAILABILITY_ERRORS } from '../../shared/constants/messages.js';
import { NotFoundError } from '../../shared/errors/domain.error.js';
import {
    mapToCreateDayOffData,
    mapToCreatePeriodOffData,
    mapToCreateTimeOffData,
    mapToCreateWorkingHoursData,
} from './availability.mapper.js';
import { AvailabilityDomainService } from './availability-domain.service.js';
import { AvailabilityFiltersProcessor } from './utils/availability-filters.processor.js';
import { AuthContext } from '../../shared/utils/request-parser.util.js';
import { Temporal } from 'temporal-polyfill';

export interface IAvailabilityService {
    addWorkingHours(input: CreateWorkingHoursInput): Promise<void>;
    addTimeOff(input: CreateTimeOffInput): Promise<void>;
    addDayOff(input: CreateDayOffInput): Promise<void>;
    addPeriodOff(input: CreatePeriodOffInput): Promise<void>;
    getAvailableSlots(workerId: number, date: string): Promise<Slot[] | null>;
    getBasicAvailability(
        filters: AvailabilityClientFilter,
    ): Promise<AvailabilityClientResponse>;
    getFullAvailability(
        filters: AvailabilityWorkerFilter,
        auth?: AuthContext,
    ): Promise<AvailabilityWorkerResponse>;
    delete(id: number, auth?: AuthContext): Promise<void>;
}

export class AvailabilityService implements IAvailabilityService {
    private readonly availabilityDomain: AvailabilityDomainService;
    private readonly filtersProcessor: AvailabilityFiltersProcessor;

    constructor(
        private readonly availabilityRepo: IAvailabilityRepository,
        private readonly userService: IUserService,
    ) {
        this.availabilityDomain = new AvailabilityDomainService(
            availabilityRepo,
            userService,
        );
        this.filtersProcessor = new AvailabilityFiltersProcessor(
            availabilityRepo,
        );
    }

    async addWorkingHours(input: CreateWorkingHoursInput): Promise<void> {
        await this.availabilityDomain.ensureWorkerExists(input.workerId);
        this.availabilityDomain.checkUniqueWorkingDays(input.workingHours);
        // Eliminar horarios anteriores y agregar los nuevos
        await this.availabilityRepo.deleteWorkingHoursByWorkerId(
            input.workerId,
        );
        const workingHoursData = mapToCreateWorkingHoursData(input);
        await this.availabilityRepo.createWorkingHourBulk(workingHoursData);
    }

    async addTimeOff(input: CreateTimeOffInput): Promise<void> {
        await this.availabilityDomain.ensureWorkerExists(input.workerId);
        const timeOff = mapToCreateTimeOffData(input);

        if (input.type === 'RECURRING') {
            await this.availabilityDomain.checkOverlappingRecurring(input);
        } else {
            this.availabilityDomain.checkFutureDate(input.date);
            await this.availabilityDomain.checkOverlapping(timeOff);
        }

        await this.availabilityRepo.createBlockedTime(timeOff);
    }

    async addDayOff(input: CreateDayOffInput): Promise<void> {
        await this.availabilityDomain.ensureWorkerExists(input.workerId);
        this.availabilityDomain.checkFutureDate(input.date);
        const dayOff = mapToCreateDayOffData(input);
        await this.availabilityDomain.checkOverlapping(dayOff);
        await this.availabilityRepo.createBlockedTime(dayOff);
    }

    async addPeriodOff(input: CreatePeriodOffInput): Promise<void> {
        await this.availabilityDomain.ensureWorkerExists(input.workerId);
        this.availabilityDomain.checkFutureDate(input.startDate);
        this.availabilityDomain.checkFutureDate(input.endDate);
        const periodOff = mapToCreatePeriodOffData(input);
        await this.availabilityDomain.checkOverlapping(periodOff);
        await this.availabilityRepo.createBlockedTime(periodOff);
    }

    async getAvailableSlots(
        workerId: number,
        date: string,
    ): Promise<Slot[] | null> {
        const dayOfWeek = Temporal.PlainDate.from(date).dayOfWeek;
        await this.availabilityDomain.ensureWorkerExists(workerId);
        return await this.filtersProcessor.getAvailableSlotsForDay({
            workerId,
            date,
            dayOfWeek,
        });
    }

    async getBasicAvailability(
        filters: AvailabilityClientFilter,
    ): Promise<AvailabilityClientResponse> {
        await this.availabilityDomain.ensureWorkerExists(filters.workerId);
        return this.filtersProcessor.processBasicAvailability(
            filters.workerId,
            filters,
        );
    }

    async getFullAvailability(
        filters: AvailabilityWorkerFilter,
        auth?: AuthContext,
    ): Promise<AvailabilityWorkerResponse> {
        const workerId = filters.workerId;
        await this.availabilityDomain.ensureWorkerExists(workerId);
        if (auth) this.availabilityDomain.validateCanView(workerId, auth);
        return this.filtersProcessor.processFullAvailability(workerId, filters);
    }

    async delete(id: number, auth?: AuthContext): Promise<void> {
        const block = await this.getBlockedTimeOrFail(id);
        if (auth) this.availabilityDomain.validateOwnership(block, auth);
        await this.availabilityRepo.deleteBlockedTime(id);
    }

    private async getBlockedTimeOrFail(id: number): Promise<BlockedTime> {
        const blockedTime = await this.availabilityRepo.findBlockedTimeById(id);
        if (!blockedTime)
            throw new NotFoundError(AVAILABILITY_ERRORS.NOT_FOUND);
        return blockedTime;
    }
}

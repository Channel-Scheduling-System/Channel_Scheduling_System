import { IAvailabilityRepository } from '../availability.repository.js';
import { IAppointmentService } from '../../appointments/appointment.service.js';
import {
    AvailabilityWorkerFilter,
    AvailabilityWorkerResponse,
    ViewType,
    AvailabilityClientFilter,
    AvailabilityClientResponse,
    DayAvailability,
    WorkerAndDayInput,
} from '../availability.types.js';
import {
    mapToDaysOffResponse,
    mapToRecurringTimeOffResponse,
    mapToSpecificTimeOffResponse,
    mapToPeriodOffResponse,
    mapToWorkingHourResponse,
    mapToDayAvailability,
} from '../availability.mapper.js';
import { SlotCalculator } from './slot-calculator.js';
import { DateIterator } from './date-iterator.js';
import {
    DateRangeCalculator,
    DateRange,
} from '../../../shared/utils/date-range-calculator.util.js';
import { Slot } from '../../../shared/types/slots.types.js';
import { Temporal } from 'temporal-polyfill';

export class AvailabilityFiltersProcessor {
    private readonly dateRangeCalculator = new DateRangeCalculator();
    private readonly slotCalculator = new SlotCalculator();

    constructor(
        private readonly availabilityRepo: IAvailabilityRepository,
        private readonly appointmentService: IAppointmentService,
    ) {}

    async processFullAvailability(
        workerId: number,
        filters: AvailabilityWorkerFilter,
    ): Promise<AvailabilityWorkerResponse> {
        const included = Array.isArray(filters.include) ? filters.include : [];
        if (included.length === 0) return {};
        const dateRange = this.calculateDateRange(filters.view, filters.date);
        return this.buildWorkerResponse(workerId, included, dateRange, filters);
    }

    private async buildWorkerResponse(
        workerId: number,
        included: string[],
        dateRange: DateRange | undefined,
        filters: AvailabilityWorkerFilter,
    ): Promise<AvailabilityWorkerResponse> {
        const response: AvailabilityWorkerResponse = {};
        for (const type of included) {
            const data = await this.fetchAvailabilityData(
                type,
                workerId,
                dateRange,
                filters,
            );
            if (data !== undefined)
                response[type as keyof AvailabilityWorkerResponse] = data;
        }
        return response;
    }

    private async fetchAvailabilityData(
        type: string,
        workerId: number,
        dateRange: DateRange | undefined,
        filters: AvailabilityWorkerFilter,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<any> {
        switch (type) {
            case 'workingHours':
                return this.getWorkingHours(
                    workerId,
                    filters.date,
                    filters.view,
                );
            case 'timesOff':
                return this.getTimesOff(
                    workerId,
                    dateRange,
                    filters.date,
                    filters.view,
                );
            case 'daysOff':
                return this.getDaysOff(workerId, dateRange);
            case 'periodsOff':
                return this.getPeriodsOff(workerId, dateRange);
            default:
                return undefined;
        }
    }

    async getWorkingHours(workerId: number, date?: string, view?: string) {
        const filter = this.buildRecurringFilter(workerId, date, view);
        const data = await this.availabilityRepo.findWorkingHours(filter);
        return data.map(mapToWorkingHourResponse);
    }

    async getAvailableSlotsForDay(
        input: WorkerAndDayInput,
    ): Promise<Slot[] | null> {
        const { workerId, date, dayOfWeek } = input;
        const workingHours = await this.availabilityRepo.findWorkingHours({
            workerId,
            dayOfWeek,
        });
        if (workingHours.length === 0) return null;

        const blockedTimes = await this.availabilityRepo.findBlockedTimesByDate(
            { workerId, date, dayOfWeek },
        );

        return this.slotCalculator.calculateAvailableSlots(
            workingHours[0],
            blockedTimes,
        );
    }

    private async getTimesOff(
        workerId: number,
        dateRange: DateRange | undefined,
        date?: string,
        view?: string,
    ) {
        const [recurring, specific] = await Promise.all([
            this.getRecurringTimesOff(workerId, date, view),
            this.getSpecificTimesOff(workerId, dateRange),
        ]);
        return { recurring, specific };
    }

    private async getRecurringTimesOff(
        workerId: number,
        date?: string,
        view?: string,
    ) {
        const filter = this.buildRecurringFilter(workerId, date, view);
        const data = await this.availabilityRepo.findRecurringTimeOffs(filter);
        return data.map(mapToRecurringTimeOffResponse);
    }

    private async getSpecificTimesOff(workerId: number, dateRange?: DateRange) {
        const data = await this.availabilityRepo.findSpecificTimeOffs({
            workerId,
            startDate: dateRange?.startDate,
            endDate: dateRange?.endDate,
        });
        return data.map(mapToSpecificTimeOffResponse);
    }

    private async getDaysOff(workerId: number, dateRange?: DateRange) {
        const data = await this.availabilityRepo.findDayOffs({
            workerId,
            startDate: dateRange?.startDate,
            endDate: dateRange?.endDate,
        });
        return data.map(mapToDaysOffResponse);
    }

    private async getPeriodsOff(workerId: number, dateRange?: DateRange) {
        const data = await this.availabilityRepo.findPeriodOffs({
            workerId,
            startDate: dateRange?.startDate,
            endDate: dateRange?.endDate,
        });
        return data.map(mapToPeriodOffResponse);
    }

    private buildRecurringFilter(
        workerId: number,
        date?: string,
        view?: string,
    ) {
        if (view !== 'DAY' || !date) return { workerId };
        const dayOfWeek = Temporal.PlainDate.from(date).dayOfWeek;
        return { workerId, dayOfWeek };
    }

    async processBasicAvailability(
        workerId: number,
        filters: AvailabilityClientFilter,
    ): Promise<AvailabilityClientResponse> {
        const dateRange = this.calculateDateRange(filters.view, filters.date);
        if (!dateRange) return [];

        const dates = DateIterator.generate(
            dateRange.startDate,
            dateRange.endDate,
        );

        const dailyAvailabilities = await Promise.all(
            dates.map(({ date, dayOfWeek }) =>
                this.buildDayAvailability({ workerId, date, dayOfWeek }),
            ),
        );

        return dailyAvailabilities.filter(
            (availability) => availability !== null,
        ) as AvailabilityClientResponse;
    }

    private async buildDayAvailability(
        input: WorkerAndDayInput,
    ): Promise<DayAvailability | null> {
        let availableSlots = await this.getAvailableSlotsForDay(input);
        if (availableSlots === null) return null;
        const occupiedSlots = await this.appointmentService.getSlots(
            input.workerId,
            input.date,
        );

        availableSlots = this.slotCalculator.subtractOccupiedSlots(
            availableSlots,
            occupiedSlots,
        );

        return mapToDayAvailability(input.date, availableSlots, occupiedSlots);
    }

    private calculateDateRange(
        view?: ViewType,
        date?: string,
    ): DateRange | undefined {
        if (!view || !date) return undefined;
        return this.dateRangeCalculator.calculate(view, date);
    }
}

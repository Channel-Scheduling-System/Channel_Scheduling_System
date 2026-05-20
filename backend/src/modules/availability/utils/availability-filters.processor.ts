import { IAvailabilityRepository } from '../availability.repository.js';
import {
    AvailabilityWorkerFilter,
    AvailabilityWorkerResponse,
    DateRange,
    ViewType,
} from '../availability.types.js';
import { DateRangeCalculator } from './date-range.calculator.js';
import {
    mapToDaysOffResponse,
    mapToRecurringTimeOffResponse,
    mapToSpecificTimeOffResponse,
    mapToPeriodOffResponse,
    mapToWorkingHourResponse,
} from '../availability.mapper.js';
import { Temporal } from 'temporal-polyfill';

export class AvailabilityFiltersProcessor {
    private readonly dateRangeCalculator = new DateRangeCalculator();

    constructor(private readonly availabilityRepo: IAvailabilityRepository) {}

    async process(
        workerId: number,
        filters: AvailabilityWorkerFilter,
    ): Promise<AvailabilityWorkerResponse> {
        const included = Array.isArray(filters.include) ? filters.include : [];
        if (included.length === 0) return {};
        const dateRange = this.calculateDateRange(filters.view, filters.date);
        return this.buildResponse(workerId, included, dateRange, filters);
    }

    private calculateDateRange(
        view?: ViewType,
        date?: string,
    ): DateRange | undefined {
        if (!view || !date) return undefined;
        return this.dateRangeCalculator.calculate(view, date);
    }

    private async buildResponse(
        workerId: number,
        included: string[],
        dateRange: DateRange | undefined,
        filters: AvailabilityWorkerFilter,
    ): Promise<AvailabilityWorkerResponse> {
        const response: AvailabilityWorkerResponse = {};
        const gettersMap = {
            workingHours: () =>
                this.getWorkingHours(workerId, filters.date, filters.view),
            daysOff: () => this.getDaysOff(workerId, dateRange),
            periodsOff: () => this.getPeriodsOff(workerId, dateRange),
            timesOff: () =>
                this.getTimesOff(
                    workerId,
                    dateRange,
                    filters.date,
                    filters.view,
                ),
        };
        for (const type of included) {
            if (type === 'timesOff') {
                response.timeOffs = await gettersMap.timesOff();
            } else if (type === 'daysOff') {
                response.dayOffs = await gettersMap.daysOff();
            } else if (type === 'periodsOff') {
                response.periodOffs = await gettersMap.periodsOff();
            } else if (type === 'workingHours') {
                response.workingHours = await gettersMap.workingHours();
            }
        }
        return response;
    }

    private async getWorkingHours(
        workerId: number,
        date?: string,
        view?: string,
    ) {
        let data;
        if (view === 'DAY' && date) {
            const dayOfWeek = Temporal.PlainDate.from(date).dayOfWeek;
            data = await this.availabilityRepo.findWorkingHours({
                workerId,
                dayOfWeek,
            });
        } else {
            data = await this.availabilityRepo.findWorkingHours({ workerId });
        }
        return data.map(mapToWorkingHourResponse);
    }

    private async getTimesOff(
        workerId: number,
        dateRange: DateRange | undefined,
        date?: string,
        view?: string,
    ) {
        const recurring = await this.getRecurringTimesOff(workerId, date, view);
        const specific = await this.getSpecificTimesOff(workerId, dateRange);
        return { recurring, specific };
    }

    private async getRecurringTimesOff(
        workerId: number,
        date?: string,
        view?: string,
    ) {
        let data;
        if (view === 'DAY' && date) {
            const dayOfWeek = Temporal.PlainDate.from(date).dayOfWeek;
            data = await this.availabilityRepo.findHourBlockedTimes({
                workerId,
                type: 'RECURRING',
                dayOfWeek,
            });
        } else {
            data = await this.availabilityRepo.findHourBlockedTimes({
                workerId,
                type: 'RECURRING',
            });
        }
        return data.map(mapToRecurringTimeOffResponse);
    }

    private async getSpecificTimesOff(workerId: number, dateRange?: DateRange) {
        const data = await this.availabilityRepo.findHourBlockedTimes({
            workerId,
            type: 'SPECIFIC',
            startDate: dateRange?.startDate,
            endDate: dateRange?.endDate,
        });
        return data.map(mapToSpecificTimeOffResponse);
    }

    private async getDaysOff(workerId: number, dateRange?: DateRange) {
        const data = await this.availabilityRepo.findBlockedTimes({
            workerId,
            type: 'DAY',
            startDate: dateRange?.startDate,
            endDate: dateRange?.endDate,
        });
        return data.map(mapToDaysOffResponse);
    }

    private async getPeriodsOff(workerId: number, dateRange?: DateRange) {
        const data = await this.availabilityRepo.findBlockedTimes({
            workerId,
            type: 'PERIOD',
            startDate: dateRange?.startDate,
            endDate: dateRange?.endDate,
        });
        return data.map(mapToPeriodOffResponse);
    }
}

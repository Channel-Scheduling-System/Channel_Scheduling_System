import { IAppointmentRepository } from '../appointment.repository.js';
import {
    AppointmentCalendarResponse,
    AppointmentFilter,
    AppointmentHistoryFilter,
    ApppointmentCalendarFilter,
    PaginatedAppointmentResponse,
    Role,
    ViewType,
} from '../appointment.types.js';
import {
    mapToClientCalendarAppointmentResponse,
    mapToHistoryAppointmentResponse,
    mapToWorkerCalendarAppointmentResponse,
} from '../appointment.mapper.js';
import {
    DateRange,
    calculateDataRange,
} from '../../../shared/utils/date-range-calculator.util.js';
import { Temporal } from 'temporal-polyfill';

export class AppointmentFiltersProcessor {
    constructor(private readonly appointmentRepo: IAppointmentRepository) {}

    async processHistoryFilters(
        filter: AppointmentHistoryFilter,
    ): Promise<PaginatedAppointmentResponse> {
        if (filter.to) {
            const to = Temporal.PlainDate.from(filter.to);
            filter.to = to.add({ days: 1 }).toString();
        }
        const { data, total } =
            await this.appointmentRepo.findAllWithPagination(filter);

        const limit = filter.limit || 10;
        const page = Math.max(1, filter.page || 1);
        const totalPages = Math.ceil(total / limit);

        return {
            data: mapToHistoryAppointmentResponse(data),
            meta: { total, page, limit, totalPages },
        };
    }

    async processCalendarFilters(
        filter: ApppointmentCalendarFilter,
        role: Role,
    ): Promise<AppointmentCalendarResponse> {
        const dateRange = this.calculateDateRange(filter.view, filter.date);
        if (!dateRange) return [];

        const newFilter: AppointmentFilter = {
            workerId: filter.workerId,
            clientId: filter.clientId,
            from: dateRange.startDate,
            to: dateRange.endDate,
        };
        const data = await this.appointmentRepo.findAllCalendar(
            newFilter,
            role,
        );

        if (role === Role.WORKER)
            return mapToWorkerCalendarAppointmentResponse(data);
        return mapToClientCalendarAppointmentResponse(data);
    }

    private calculateDateRange(
        view?: ViewType,
        date?: string,
    ): DateRange | undefined {
        if (!view || !date) return undefined;
        const range = calculateDataRange(view, date);

        if (range.startDate === range.endDate) {
            const to = Temporal.PlainDate.from(range.endDate);
            range.endDate = to.add({ days: 1 }).toString();
        }

        return range;
    }
}

import { IAppointmentRepository } from '../appointment.repository.js';
import {
    AppointmentHistoryFilter,
    PaginatedAppointmentResponse,
} from '../appointment.types.js';
import { mapToHistoryAppointmentResponse } from '../appointment.mapper.js';
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
}

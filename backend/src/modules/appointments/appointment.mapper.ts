import { Appointment } from '@prisma/client.js';
import {
    Role,
    Status,
    CreateAppointmentData,
    CreateAppointmentInput,
    CreateAppointmentResponse,
    VerifyOverlapInput,
    OverlapVerificationInput,
    ExtendedAppointmentResponse,
    ExtendedAppointment,
    AppointmentHistoryFilter,
    AppointmentResponse,
    BasicAppointment,
    ApppointmentCalendarFilter,
    ClientAppointmentResponse,
    WorkerAppointmentResponse,
    NotifyAppointment,
    NotifyAppointmentResponse,
    AppointmentCountFilter,
} from './appointment.types.js';
import { Slot } from '../../shared/types/slots.types.js';
import {
    stripSecondsFromDateTime,
    dateTimeToIsoTime,
} from '../../shared/utils/times-parser.util.js';
import { Temporal } from 'temporal-polyfill';
import {
    appointmentHistoryFilterSchema,
    appointmentCalendarFilterSchema,
    countFilterSchema,
} from './appointment.validator.js';
import {
    dateToInstant,
    formatLongDate,
    formatTime,
} from '../../shared/utils/temporal.util.js';

export function mapToVerifyOverlapInput(
    input:
        | CreateAppointmentInput
        | OverlapVerificationInput
        | NotifyAppointment,
): VerifyOverlapInput {
    const startAt = dateToInstant(input.startAt).toJSON();
    const endAt =
        'endAt' in input
            ? dateToInstant(input.endAt).toJSON()
            : calculateEndDate(input.startAt, input.services);
    return {
        workerId: input.workerId,
        startAt: Temporal.Instant.from(startAt).toJSON(),
        endAt: endAt,
        clientId: 'clientId' in input ? input.clientId : undefined,
    };
}

export function mapToAppointmentData(
    input: CreateAppointmentInput,
    createdBy: Role,
): CreateAppointmentData {
    return {
        workerId: input.workerId,
        clientId: input.clientId,
        startAt: Temporal.Instant.from(input.startAt).toJSON(),
        endAt: calculateEndDate(input.startAt, input.services),
        status: createdBy === Role.WORKER ? Status.SCHEDULED : Status.PENDING,
        createdBy: createdBy,
        notes: input.notes,
        services: input.services.map((service) => ({
            serviceId: service.serviceId,
            customDurationMin: service.customDuration ?? 0,
            customPrice: service.customPrice ?? 0,
        })),
    };
}

export function mapToCreateAppointmentResponse(
    appointment: Appointment,
): CreateAppointmentResponse {
    return {
        id: appointment.id,
        startAt: appointment.startAt,
        endAt: appointment.endAt,
        status: appointment.status,
    };
}

export function mapToAppointmentExtendedResponse(
    appointment: ExtendedAppointment,
): ExtendedAppointmentResponse {
    return {
        id: appointment.id,
        startAt: stripSecondsFromDateTime(appointment.startAt),
        endAt: stripSecondsFromDateTime(appointment.endAt),
        status: appointment.status,
        createdBy: appointment.createdBy,
        notes: appointment.notes,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
        worker: {
            id: appointment.worker.id,
            name: `${appointment.worker.firstName} ${appointment.worker.lastName}`,
        },
        client: {
            id: appointment.client.id,
            name: `${appointment.client.firstName} ${appointment.client.lastName}`,
        },
        services: appointment.services.map((s) => ({
            id: s.service.id,
            customDuration: s.customDurationMin,
            customPrice: s.customPrice,
            service: {
                id: s.service.id,
                name: s.service.name,
                color: s.service.colorHex,
                defaultDuration: s.service.defaultDurationMin,
                defaultPrice: s.service.defaultPrice,
            },
        })),
    };
}

export function mapToNotifyAppointmentResponse(
    appointment: NotifyAppointment,
): NotifyAppointmentResponse {
    return {
        date: formatLongDate(appointment.startAt),
        time:
            formatTime(appointment.startAt) +
            ' - ' +
            formatTime(appointment.endAt),
        status: appointment.status,
        worker: {
            name: `${appointment.worker.firstName} ${appointment.worker.lastName}`,
            email: appointment.worker.email,
            phone: appointment.worker.phone,
        },
        client: {
            name: `${appointment.client.firstName} ${appointment.client.lastName}`,
            email: appointment.client.email,
            phone: appointment.client.phone,
        },
        services: appointment.services.map((s) => ({
            name: s.service.name,
            color: s.service.colorHex,
        })),
    };
}

export function mapToSlots(appointment: Appointment[]): Slot[] {
    return appointment.map((apm) => ({
        start: dateTimeToIsoTime(apm.startAt.toISOString()),
        end: dateTimeToIsoTime(apm.endAt.toISOString()),
    }));
}

export function mapToHistoryAppointmentResponse(
    appointments: BasicAppointment[],
): AppointmentResponse[] {
    return appointments.map((apm) => ({
        id: apm.id,
        startAt: stripSecondsFromDateTime(apm.startAt),
        endAt: stripSecondsFromDateTime(apm.endAt),
        status: apm.status,
        worker: {
            id: apm.worker.id,
            name: `${apm.worker.firstName} ${apm.worker.lastName}`,
        },
        client: {
            id: apm.client.id,
            name: `${apm.client.firstName} ${apm.client.lastName}`,
        },
        services: apm.services.map((s) => ({
            id: s.service.id,
            name: s.service.name,
            color: s.service.colorHex,
        })),
    }));
}

export function mapToWorkerCalendarAppointmentResponse(
    appointments: BasicAppointment[],
): WorkerAppointmentResponse[] {
    return appointments.map((apm) => ({
        id: apm.id,
        startAt: stripSecondsFromDateTime(apm.startAt),
        endAt: stripSecondsFromDateTime(apm.endAt),
        status: apm.status,
        notes: apm.notes,
        client: {
            id: apm.client.id,
            name: `${apm.client.firstName} ${apm.client.lastName}`,
        },
        worker: {
            id: apm.worker.id,
            name: `${apm.worker.firstName} ${apm.worker.lastName}`,
        },
        services: apm.services.map((s) => ({
            id: s.service.id,
            name: s.service.name,
            color: s.service.colorHex,
        })),
    }));
}

export function mapToClientCalendarAppointmentResponse(
    appointments: BasicAppointment[],
): ClientAppointmentResponse[] {
    return appointments.map((apm) => ({
        id: apm.id,
        startAt: stripSecondsFromDateTime(apm.startAt),
        endAt: stripSecondsFromDateTime(apm.endAt),
        status: apm.status,
        worker: {
            id: apm.worker.id,
            name: `${apm.worker.firstName} ${apm.worker.lastName}`,
        },
        services: apm.services.map((s) => ({
            id: s.service.id,
            name: s.service.name,
            color: s.service.colorHex,
        })),
    }));
}

export function calculateEndDate(
    startAt: string,
    services: { customDuration?: number }[],
): string {
    const totalDurationMin = services.reduce((total, service) => {
        return total + (service.customDuration ?? 0);
    }, 0);
    const startInstant = Temporal.Instant.from(startAt);
    const endInstant = startInstant.add({ minutes: totalDurationMin });
    return endInstant.toJSON();
}

export function mapToAppointmentHistoryFilter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filters: Record<string, any>,
): AppointmentHistoryFilter {
    return appointmentHistoryFilterSchema.parse(filters);
}

export function mapToAppointmentCalendarFilter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filters: Record<string, any>,
): ApppointmentCalendarFilter {
    return appointmentCalendarFilterSchema.parse(filters);
}

export function mapToAppointmentCountFilter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filters: Record<string, any>,
): AppointmentCountFilter {
    return countFilterSchema.parse(filters);
}

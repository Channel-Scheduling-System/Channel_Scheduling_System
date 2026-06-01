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
} from './appointment.types.js';
import { Slot } from '../../shared/types/slots.types.js';
import {
    dateTimeToIsoDateTimeWithoutSeconds,
    dateTimeToIsoTime,
} from '../../shared/utils/times-parser.util.js';
import { Temporal } from 'temporal-polyfill';
import { appointmentHistoryFilterSchema } from './appointment.validator.js';

export function mapToVerifyOverlapInput(
    input: CreateAppointmentInput | OverlapVerificationInput,
): VerifyOverlapInput {
    return {
        workerId: input.workerId,
        startAt: Temporal.Instant.from(input.startAt).toJSON(),
        endAt: calculateEndDate(input.startAt, input.services),
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
            customDurationMin: service.customDurationMin ?? 0,
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
        status: appointment.status as Status,
    };
}

export function mapToAppointmentExtendedResponse(
    appointment: ExtendedAppointment,
): ExtendedAppointmentResponse {
    return {
        id: appointment.id,
        startAt: dateTimeToIsoDateTimeWithoutSeconds(appointment.startAt),
        endAt: dateTimeToIsoDateTimeWithoutSeconds(appointment.endAt),
        status: appointment.status as Status,
        createdBy: appointment.createdBy as Role,
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
        services: appointment.services,
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
        startAt: dateTimeToIsoDateTimeWithoutSeconds(apm.startAt),
        endAt: dateTimeToIsoDateTimeWithoutSeconds(apm.endAt),
        status: apm.status as Status,
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
            colorHex: s.service.colorHex,
        })),
    }));
}

export function calculateEndDate(
    startAt: string,
    services: { customDurationMin?: number }[],
): string {
    const totalDurationMin = services.reduce((total, service) => {
        return total + (service.customDurationMin ?? 0);
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

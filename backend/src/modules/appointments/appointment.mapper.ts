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
} from './appointment.types.js';
import { Temporal } from 'temporal-polyfill';

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
        startAt: appointment.startAt,
        endAt: appointment.endAt,
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

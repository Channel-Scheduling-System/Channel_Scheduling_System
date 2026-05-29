import z from 'zod';
import { EntityId } from './entity-base.schema';
import { serviceDuration, servicePrice } from './service.schema';

export const AppointmentDateTime = z.iso.datetime({ precision: -1 });

export const AppointmentNotes = z.string()
        .max(300, 'Las notas no pueden exceder 300 caracteres')
        .optional();

export const AppointmentServiceSchema = z.object({
	serviceId: EntityId,
	customDuration: serviceDuration,
	customPrice: servicePrice
});

export const AppointmentSchema = z.object({
	workerId: EntityId,
	clientId: EntityId,
	startAt: AppointmentDateTime,
	services: z.array(AppointmentServiceSchema),
	notes: AppointmentNotes
});

export const AppointmentStatus = z.enum([
	'PENDING',
	'REJECTED',
	'SCHEDULED',
	'IN_PROGRESS',
	'CANCELLED',
	'COMPLETED',
	'NO_SHOW',
]);
export type AppointmentStatus = z.infer<typeof AppointmentStatus>;

export type AppointmentService = z.infer<typeof AppointmentServiceSchema>;
export type Appointment = z.infer<typeof AppointmentSchema>;
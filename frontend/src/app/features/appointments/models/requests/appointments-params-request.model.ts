import { z } from 'zod';
import { AppointmentStatus } from '../../../../shared/models/entities/appointment.schema';
import { ConfigView, dateParam } from '../../../../shared/models/entities/date.schema';

const numericParam = (label: string) =>
	z
		.string()
		.regex(/^\d+$/, `${label} debe ser un numero entero`)
		.transform(val => Number(val))
		.pipe(z.number().int().positive());

const statusParam = z
	.string()
	.transform(val => val.split(',').map(s => s.trim()))
	.pipe(z.array(AppointmentStatus).min(1));

export const appointmentsParamsHistoryRequestSchema = z.object({
	workerId: numericParam('workerId').optional(),
	clientId: numericParam('clientId').optional(),
	status: statusParam.optional(),
	from: dateParam.optional(),
	to: dateParam.optional(),
	page: numericParam('page').optional(),
});

export const appointmentsActiveParamsRequestSchema = z.object({
	view: ConfigView,
	date: dateParam,
	clientId: numericParam('clientId').optional(),
});

export const getQuantityStatusAppointmentsParamsRequestSchema = z.object({
	status: statusParam.optional(),
});

export type AppointmentsParamsHistoryRequest = z.infer<
	typeof appointmentsParamsHistoryRequestSchema
>;

export type AppointmentsActiveParamsRequest = z.infer<
	typeof appointmentsActiveParamsRequestSchema
>;

export type GetQuantityStatusAppointmentsParamsRequest = z.infer<
	typeof getQuantityStatusAppointmentsParamsRequestSchema
>;

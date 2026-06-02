import { z } from 'zod';
import { BaseSuccessResponseSchema } from '../../../../shared/models/api/success-response.schema';
import { AppointmentDateTime, AppointmentNotes, AppointmentStatus } from '../../../../shared/models/entities/appointment.schema';
import { EntityId, MetaSchema } from '../../../../shared/models/entities/entity-base.schema';
import { ServiceSchema } from '../../../../shared/models/entities/service.schema';
import { UserName, UserSchema } from '../../../../shared/models/entities/user.schema';

const UserCompactSchema = UserSchema.pick({ id: true}).extend({
	name: UserName
});

const ServiceCompactSchema = ServiceSchema.pick({ id: true, name: true, color: true });

const AppointmentHistoryItemSchema = z.object({
	id: EntityId,
	startAt: AppointmentDateTime,
	endAt: AppointmentDateTime,
	status: AppointmentStatus,
	worker: UserCompactSchema,
	client: UserCompactSchema,
	services: z.array(ServiceCompactSchema),
	notes: AppointmentNotes.optional()
});

const AppointmenActiveItemSchema = AppointmentHistoryItemSchema.omit({ client: true, worker: true }).extend({
	client: UserCompactSchema.optional(),
	worker: UserCompactSchema.optional()
});

const AppointmentHistoryDataSchema = z.array(AppointmentHistoryItemSchema);

export const AppointmentsListHistoryResponseSchema = BaseSuccessResponseSchema.extend({
	data: AppointmentHistoryDataSchema,
	meta: MetaSchema
});

export const AppointmentsListActiveResponseSchema = BaseSuccessResponseSchema.extend({
	data: z.array(AppointmenActiveItemSchema)
});

export type AppointmentsListHistoryResponse = z.infer<typeof AppointmentsListHistoryResponseSchema>;
export type AppointmentsListActiveResponse = z.infer<typeof AppointmentsListActiveResponseSchema>;
export type AppointmentHistoryItem = z.infer<typeof AppointmentHistoryItemSchema>;

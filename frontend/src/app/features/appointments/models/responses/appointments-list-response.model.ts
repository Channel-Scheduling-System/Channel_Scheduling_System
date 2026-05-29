import { z } from 'zod';
import { BaseSuccessResponseSchema } from '../../../../shared/models/api/success-response.schema';
import { AppointmentDateTime, AppointmentNotes, AppointmentStatus } from '../../../../shared/models/entities/appointment.schema';
import { EntityId, MetaSchema } from '../../../../shared/models/entities/entity-base.schema';
import { ServiceSchema } from '../../../../shared/models/entities/service.schema';
import { UserSchema } from '../../../../shared/models/entities/user.schema';

const AppointmentHistoryItemSchema = z.object({
	id: EntityId,
	startAt: AppointmentDateTime,
	endAt: AppointmentDateTime,
	status: AppointmentStatus,
	worker: UserSchema,
	client: UserSchema,
	services: z.array(ServiceSchema),
	notes: AppointmentNotes.optional()
});

const AppointmentHistoryDataSchema = z.array(AppointmentHistoryItemSchema);

export const AppointmentsListHistoryResponseSchema = BaseSuccessResponseSchema.extend({
	data: AppointmentHistoryDataSchema,
	meta: MetaSchema
});

export const AppointmentsListActiveResponseSchema = BaseSuccessResponseSchema.extend({
	data: AppointmentHistoryDataSchema
});

export type AppointmentsListHistoryResponse = z.infer<typeof AppointmentsListHistoryResponseSchema>;
export type AppointmentsListActiveResponse = z.infer<typeof AppointmentsListActiveResponseSchema>;
export type AppointmentHistoryItem = z.infer<typeof AppointmentHistoryItemSchema>;

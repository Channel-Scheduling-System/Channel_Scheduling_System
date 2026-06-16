import z from "zod";
import {
	AppointmentDateTime,
	AppointmentSchema,
	AppointmentServiceSchema
} from "../../../../shared/models/entities/appointment.schema";

const RescheduleAppointmentServiceSchema = AppointmentServiceSchema.pick({
	serviceId: true
});

export const UpdateAppointmentRequestSchema = AppointmentSchema.omit({
	workerId: true,
	clientId: true
});

export const RescheduleAppointmentRequestSchema = z.object({
	startAt: AppointmentDateTime,
	services: z.array(RescheduleAppointmentServiceSchema)
});

export type UpdateAppointmentRequest = z.infer<typeof UpdateAppointmentRequestSchema>;
export type RescheduleAppointmentRequest = z.infer<typeof RescheduleAppointmentRequestSchema>;

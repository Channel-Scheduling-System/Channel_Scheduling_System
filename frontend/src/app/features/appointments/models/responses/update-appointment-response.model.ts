import z from "zod";
import { BaseSuccessResponseSchema } from "../../../../shared/models/api/success-response.schema";

export const UpdateAppointmentResponseSchema = BaseSuccessResponseSchema;

export const RescheduleAppointmentResponseSchema = BaseSuccessResponseSchema;

export type UpdateAppointmentResponse = z.infer<typeof UpdateAppointmentResponseSchema>;
export type RescheduleAppointmentResponse = z.infer<typeof RescheduleAppointmentResponseSchema>;
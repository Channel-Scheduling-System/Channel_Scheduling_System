import z from "zod";
import { BaseSuccessResponseSchema } from "../../../../shared/models/api/success-response.schema";

export const VerifyOverlapResponseSchema = BaseSuccessResponseSchema;
export const CreateAppointmentResponseSchema = BaseSuccessResponseSchema;

export type VerifyOverlapResponse = z.infer<typeof VerifyOverlapResponseSchema>;
export type CreateAppointmentResponse = z.infer<typeof CreateAppointmentResponseSchema>;
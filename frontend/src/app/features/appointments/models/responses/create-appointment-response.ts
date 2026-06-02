import z from "zod";
import { BaseSuccessResponseSchema, SuccessResponseWithDataSchema } from "../../../../shared/models/api/success-response.schema";

const VerifyOverlapDataSchema = z.object({
	allowed: z.boolean(),
	needsConfirmation: z.boolean(),
});

export const VerifyOverlapResponseSchema = SuccessResponseWithDataSchema(VerifyOverlapDataSchema);
export const CreateAppointmentResponseSchema = BaseSuccessResponseSchema;

export type VerifyOverlapResponse = z.infer<typeof VerifyOverlapResponseSchema>;
export type CreateAppointmentResponse = z.infer<typeof CreateAppointmentResponseSchema>;
import z from "zod";
import { BaseSuccessResponseSchema } from "../../../../shared/models/api/success-response.schema";


export const ResetUserPasswordResponseSchema = BaseSuccessResponseSchema;

export type ResetUserPasswordResponse = z.infer<typeof ResetUserPasswordResponseSchema>;
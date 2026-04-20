import z from "zod";
import { BaseSuccessResponseSchema } from "../../../../shared/models/api/success-response.schema";

export const RegisterUserResponseSchema = BaseSuccessResponseSchema;

export type RegisterUserResponse = z.infer<typeof RegisterUserResponseSchema>;
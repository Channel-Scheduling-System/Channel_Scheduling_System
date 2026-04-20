import z from "zod";
import { BaseSuccessResponseSchema } from "../../../../shared/models/api/success-response.schema";


export const RegisterFirstAdminResponseSchema = BaseSuccessResponseSchema;

export type RegisterFirstAdminResponse = z.infer<typeof RegisterFirstAdminResponseSchema>;
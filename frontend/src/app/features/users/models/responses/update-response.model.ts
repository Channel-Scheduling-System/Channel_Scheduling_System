import z from "zod";
import { BaseSuccessResponseSchema } from "../../../../shared/models/api/success-response.schema";


export const UpdateUserResponseSchema = BaseSuccessResponseSchema;

export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;
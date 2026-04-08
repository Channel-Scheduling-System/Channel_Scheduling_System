import z from "zod";
import { BaseSuccessResponseSchema } from "../../../../../shared/models/api/success-response.schema";


export const UpdateProfileResponseSchema = BaseSuccessResponseSchema;

export type UpdateProfileResponse = z.infer<typeof UpdateProfileResponseSchema>;
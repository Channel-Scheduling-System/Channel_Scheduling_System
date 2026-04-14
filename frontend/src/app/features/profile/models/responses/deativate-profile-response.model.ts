import z from "zod";
import { BaseSuccessResponseSchema } from "../../../../shared/models/api/success-response.schema";


export const DeactivateProfileResponseSchema = BaseSuccessResponseSchema;

export type DeactivateProfileResponse = z.infer<typeof DeactivateProfileResponseSchema>;
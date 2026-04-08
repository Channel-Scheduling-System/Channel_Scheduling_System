import z from "zod";
import { BaseSuccessResponseSchema } from "../../../../../shared/models/api/success-response.schema";


export const SetStateUserResponseSchema = BaseSuccessResponseSchema;

export type SetStateUserResponse = z.infer<typeof SetStateUserResponseSchema>;
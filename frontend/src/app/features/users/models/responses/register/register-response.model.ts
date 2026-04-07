import z from "zod";
import { BaseSuccessResponseSchema } from "../../../../../shared/models/api/success-response.schema";
import { AuthData, AuthResponseSchema } from "../auth-response.model";
import { AuthResponse } from "../auth-response.model";

export type RegisterData = AuthData;
export const RegisterResponseSchema = AuthResponseSchema;
export type RegisterResponse = AuthResponse;

export const RegisterUserResponseSchema = BaseSuccessResponseSchema;

export type RegisterUserResponse = z.infer<typeof RegisterUserResponseSchema>;
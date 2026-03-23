import { AuthData, AuthResponseSchema } from "../auth-response.model";
import { AuthResponse } from "../auth-response.model";

export type RegisterData = AuthData;
export const RegisterResponseSchema = AuthResponseSchema;
export type RegisterResponse = AuthResponse;
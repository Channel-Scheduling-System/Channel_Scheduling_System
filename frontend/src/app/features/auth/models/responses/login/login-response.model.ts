import { AuthData, AuthResponseSchema } from '../auth-response.model';
import { AuthResponse } from '../auth-response.model';

export type LoginData = AuthData;
export const LoginResponseSchema = AuthResponseSchema;
export type LoginResponse = AuthResponse;
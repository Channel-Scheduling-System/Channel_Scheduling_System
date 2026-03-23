import { AuthData, AuthResponseSchema } from '../../../../users/models/responses/auth-response.model';
import { AuthResponse } from '../../../../users/models/responses/auth-response.model';

export type LoginData = AuthData;
export const LoginResponseSchema = AuthResponseSchema;
export type LoginResponse = AuthResponse;
import { AuthData, AuthResponseSchema } from "../../../features/users/models/responses/auth-response.model";
import { AuthResponse } from "../../../features/users/models/responses/auth-response.model";

export type AdminRegisterData = AuthData;
export const AdminRegisterResponseSchema = AuthResponseSchema;
export type AdminRegisterResponse = AuthResponse;
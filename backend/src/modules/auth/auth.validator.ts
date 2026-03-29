import { z } from 'zod';
import {
    validateBodyDTO,
    validateCookieDTO,
} from '../../shared/middlewares/validateDTO.middleware.js';
import {
    UserPassword,
    UserSchema,
    UserAlias,
    UserEmail,
    UserPhone,
} from '../users/user.validator.js';

// REGISTER
//* -----------------------------
export const RegisterDTO = UserSchema.extend({
    password: UserPassword,
})
    .omit({ id: true })
    .strict();

// LOGIN
//* -----------------------------
export const LoginDTO = z
    .object({
        identifier: z.union([UserAlias, UserEmail, UserPhone]),
        password: UserPassword,
    })
    .strict();

// REFRESH TOKEN
//* -----------------------------
export const RefreshTokenDTO = z
    .string()
    .min(1, 'El token es requerido')
    .regex(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
        'Token JWT inválido',
    );

// RECOVERY REQUEST
//* -----------------------------
export const RecoveryRequestDTO = z
    .object({
        email: UserEmail,
    })
    .strict();

// RESET PASSWORD
//* -----------------------------
export const ResetPasswordDTO = z
    .object({
        email: UserEmail,
        code: z.string().length(6, 'Código inválido'),
        newPassword: UserPassword,
    })
    .strict();

// TYPES (DTOs)
//* -----------------------------
export type LoginRequestDTO = z.infer<typeof LoginDTO>;
export type RegisterRequestDTO = z.infer<typeof RegisterDTO>;
export type RecoveryRequest = z.infer<typeof RecoveryRequestDTO>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordDTO>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenDTO>;

// Export centralizado
//* -----------------------------
export const authValidator = {
    register: validateBodyDTO(RegisterDTO),
    login: validateBodyDTO(LoginDTO),
    recoveryRequest: validateBodyDTO(RecoveryRequestDTO),
    resetPassword: validateBodyDTO(ResetPasswordDTO),
    refreshToken: validateCookieDTO('refreshToken', RefreshTokenDTO),
};

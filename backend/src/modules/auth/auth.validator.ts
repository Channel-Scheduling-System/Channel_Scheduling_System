import { z } from 'zod';
import { validateDTO } from '#/shared/middlewares/validateDTO.middleware.js';

// ENUMS
//* -----------------------------
export const SystemRole = z.enum(['ADMIN', 'CLIENT', 'WORKER']);

// LOGIN
//* -----------------------------
export const LoginDTO = z
    .object({
        identifier: z.string().min(1, 'El identificador es requerido'), // Email o alias
        password: z.string().min(1, 'La contraseña es requerida'),
    })
    .strict();

// REGISTER
//* -----------------------------
export const RegisterDTO = z
    .object({
        firstName: z.string().min(1, 'El nombre es requerido'),
        lastName: z.string().min(1, 'El apellido es requerido'),
        alias: z.string().min(1, 'El alias es requerido'),
        email: z.string().email('Email inválido'),
        phone: z.string().optional(),
        password: z
            .string()
            .min(8, 'La contraseña debe tener al menos 8 caracteres'),
        role: SystemRole,
    })
    .strict();

// RECOVERY REQUEST
//* -----------------------------
export const RecoveryRequestDTO = z
    .object({
        email: z.string().email('Email inválido'),
    })
    .strict();

// RESET PASSWORD
//* -----------------------------
export const ResetPasswordDTO = z
    .object({
        email: z.string().email('Email inválido'),
        code: z.string().length(6, 'Código inválido'),
        newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
    })
    .strict();

// REFRESH TOKEN
//* -----------------------------
export const RefreshTokenDTO = z
    .object({
        refreshToken: z.string().min(10),
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
    login: validateDTO(LoginDTO),
    register: validateDTO(RegisterDTO),
    recoveryRequest: validateDTO(RecoveryRequestDTO),
    resetPassword: validateDTO(ResetPasswordDTO),
    refreshToken: validateDTO(RefreshTokenDTO),
};

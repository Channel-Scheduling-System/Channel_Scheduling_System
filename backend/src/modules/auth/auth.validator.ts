import { z } from 'zod';
import { validateDTO } from '#/shared/middlewares/validateDTO.middleware.js';

// ENUMS
//* -----------------------------
export const SystemRole = z.enum(['ADMIN', 'CLIENT', 'WORKER']);

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

// TYPES (DTOs)
//* -----------------------------
export type RegisterRequestDTO = z.infer<typeof RegisterDTO>;

// Export centralizado
//* -----------------------------
export const authValidator = {
    register: validateDTO(RegisterDTO),
};

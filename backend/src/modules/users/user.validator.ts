import {
    ParamIdDTO,
    validateBodyDTO,
    validateParamsDTO,
    validateQueryDTO,
} from '../../shared/middlewares/validateDTO.middleware.js';
import { Id } from '../../shared/zod/shemas.js';
import { z } from 'zod';

export const Role = z.enum(['ADMIN', 'CLIENT', 'WORKER']);

export const UserAlias = z
    .string()
    .regex(
        /^[a-zA-Z0-9_-]+$/,
        'El alias solo puede contener letras, números, _ o -',
    )
    .min(3, 'El alias debe tener al menos 3 caracteres')
    .max(30, 'El alias no puede exceder 30 caracteres');

export const UserEmail = z
    .string()
    .regex(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Formato de email inválido. Ejemplo: usuario@dominio.com',
    )
    .min(5, 'El email debe tener al menos 5 caracteres')
    .max(80, 'El email no puede exceder 80 caracteres');

export const UserPhone = z
    .string()
    .regex(/^\d+$/, 'El teléfono solo debe contener números')
    .min(10, 'El teléfono debe tener 10 dígitos')
    .max(10, 'El teléfono no puede exceder los 10 dígitos');

export const UserPassword = z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(50, 'La contraseña no puede exceder 50 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .regex(
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        'La contraseña debe contener al menos un carácter especial',
    );

export const UserSchema = z.object({
    id: Id,
    alias: UserAlias,
    firstName: z
        .string()
        .regex(
            /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/,
            'El nombre solo puede contener letras y espacios',
        )
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(80, 'El nombre no puede exceder 50 caracteres'),
    lastName: z
        .string()
        .regex(
            /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/,
            'El apellido solo puede contener letras y espacios',
        )
        .min(2, 'El apellido debe tener al menos 2 caracteres')
        .max(80, 'El apellido no puede exceder 50 caracteres'),
    phone: UserPhone,
    email: UserEmail,
    role: Role,
});

// TYPES (DTOs)
//* -----------------------------
export type UserData = z.infer<typeof UserSchema>;

export const CreateUserInput = UserSchema.extend({
    password: UserPassword,
}).omit({ id: true });

export const CreateFirstAdminInput = CreateUserInput.extend({
    secretCode: z
        .string()
        .length(10, 'El código secreto debe tener exactamente 10 caracteres'),
});

// FILTERS
export const UserFiltersSchema = z.object({
    role: Role.optional(),
});

// Export centralizado
//* -----------------------------
export const userValidator = {
    create: validateBodyDTO(CreateUserInput),
    createFirstAdmin: validateBodyDTO(CreateFirstAdminInput),
    id: validateParamsDTO(ParamIdDTO),
    filters: validateQueryDTO(UserFiltersSchema),
};

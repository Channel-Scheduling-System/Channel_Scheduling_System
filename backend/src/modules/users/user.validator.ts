import {
    ParamIdDTO,
    validateBodyDTO,
    validateParamsDTO,
    validateQueryDTO,
} from '../../shared/middlewares/validateDTO.middleware.js';
import { Id, oneOrMany } from '../../shared/zod/shemas.js';
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
})
    .omit({ id: true })
    .strict();

export const CreateFirstAdminInput = CreateUserInput.extend({
    secretCode: z.string().length(10, 'Código secreto con longitud incorrecta'),
})
    .omit({ role: true })
    .strict();

export const UpdateUserInput = UserSchema.partial()
    .omit({
        id: true,
        role: true,
    })
    .strict();

export const UpdatePasswordInput = z
    .object({
        password: UserPassword,
        newPassword: UserPassword,
    })
    .strict();

// FILTERS
export const UserPaginationSchema = z.object({
    page: z.coerce.number().positive('Página debe ser positiva').optional(),
    limit: z.coerce
        .number()
        .positive('Límite debe ser positivo')
        .max(100, 'Límite máximo es 100 registros')
        .optional(),
});

export const UserFiltersSchema = z.object({
    role: oneOrMany(Role),
    isActive: z.union([z.boolean(), z.stringbool()]).optional(),
    identifier: z.string().optional(),
});

export const UserQuerySchema = UserFiltersSchema.and(UserPaginationSchema);

// Export centralizado
//* -----------------------------
export const userValidator = {
    create: validateBodyDTO(CreateUserInput),
    createFirstAdmin: validateBodyDTO(CreateFirstAdminInput),
    update: validateBodyDTO(UpdateUserInput),
    updatePassword: validateBodyDTO(UpdatePasswordInput),
    id: validateParamsDTO(ParamIdDTO),
    filters: validateQueryDTO(UserQuerySchema),
};

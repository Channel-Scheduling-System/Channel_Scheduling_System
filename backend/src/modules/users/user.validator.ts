import {
    validateBodyDTO,
    validateParamsDTO,
    validateQueryDTO,
} from '../../shared/middlewares/validateDTO.middleware.js';
import {
    id,
    limitSchema,
    oneOrMany,
    pageSchema,
    paramId,
    updateStateDTO,
} from '../../shared/zod/shemas.js';
import { z } from 'zod';

export const role = z.enum(['ADMIN', 'CLIENT', 'WORKER']);

export const userAlias = z
    .string()
    .regex(
        /^[a-zA-Z0-9_-]+$/,
        'El alias solo puede contener letras, números, _ o -',
    )
    .min(3, 'El alias debe tener al menos 3 caracteres')
    .max(30, 'El alias no puede exceder 30 caracteres');

export const userEmail = z
    .string()
    .regex(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Formato de email inválido. Ejemplo: usuario@dominio.com',
    )
    .min(5, 'El email debe tener al menos 5 caracteres')
    .max(80, 'El email no puede exceder 80 caracteres');

export const userPhone = z
    .string()
    .regex(/^\d+$/, 'El teléfono solo debe contener números')
    .min(10, 'El teléfono debe tener 10 dígitos')
    .max(10, 'El teléfono no puede exceder los 10 dígitos');

export const userPassword = z
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

const userSchema = z.object({
    id: id,
    alias: userAlias,
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
    phone: userPhone,
    email: userEmail,
    role: role,
});

// TYPES (DTOs)
//* -----------------------------
export const createUserInput = userSchema
    .extend({
        password: userPassword,
    })
    .omit({ id: true })
    .strict();

const createFirstAdminDTO = createUserInput
    .extend({
        secretCode: z
            .string()
            .length(10, 'Código secreto con longitud incorrecta'),
    })
    .omit({ role: true })
    .strict();

const updateUserDTO = userSchema
    .partial()
    .omit({
        id: true,
        role: true,
    })
    .strict();

const updatePasswordDTO = z
    .object({
        password: userPassword,
        newPassword: userPassword,
    })
    .strict();

const deactivateMeDTO = z
    .object({
        password: userPassword,
    })
    .strict();

// FILTERS
export const userPaginationSchema = z.object({
    page: pageSchema.optional(),
    limit: limitSchema(100).optional(),
});

export const userFiltersSchema = z.object({
    role: oneOrMany(role),
    isActive: z.union([z.boolean(), z.stringbool()]).optional(),
    identifier: z.string().optional(),
});

const userQuerySchema = userFiltersSchema.and(userPaginationSchema);

// Export centralizado
//* -----------------------------
export const userValidator = {
    create: validateBodyDTO(createUserInput),
    createFirstAdmin: validateBodyDTO(createFirstAdminDTO),
    update: validateBodyDTO(updateUserDTO),
    updatePassword: validateBodyDTO(updatePasswordDTO),
    updateState: validateBodyDTO(updateStateDTO),
    deactivateMe: validateBodyDTO(deactivateMeDTO),
    id: validateParamsDTO(paramId),
    filters: validateQueryDTO(userQuerySchema),
};

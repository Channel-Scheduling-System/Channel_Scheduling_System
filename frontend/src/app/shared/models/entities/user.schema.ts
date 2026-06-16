import { z } from 'zod';
import { ROLES } from '../../../core/constants/roles.constants';

export const UserName = z.string()
    .regex(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres');

export const UserSchema = z.object({
    id: z.number()
        .positive('El ID debe ser un número positivo')
        .int('El ID debe ser un número entero'),
    firstName: z.string()
        .regex(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres'),
    lastName: z.string()
        .regex(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/, 'El apellido solo puede contener letras y espacios')
        .min(2, 'El apellido debe tener al menos 2 caracteres')
        .max(50, 'El apellido no puede exceder 50 caracteres'),
    alias: z.string()
        .regex(/^[a-zA-Z0-9_-]+$/, 'El alias solo puede contener letras, números, _ o -')
        .min(3, 'El alias debe tener al menos 3 caracteres')
        .max(30, 'El alias no puede exceder 30 caracteres'),
    email: z.string()
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Formato de email inválido. Ejemplo: usuario@dominio.com')
        .min(5, 'El email debe tener al menos 5 caracteres')
        .max(80, 'El email no puede exceder 80 caracteres'),
    phone: z.string()
        .regex(/^\d+$/, 'El teléfono solo debe contener números')
        .min(10, 'El teléfono debe tener 10 dígitos')
        .max(10, 'El teléfono no puede exceder los 10 dígitos'),
    role: z.enum(ROLES).refine(val => ROLES.includes(val), {
        message: `El rol debe ser uno de: ${ROLES.join(', ')}`
        }),
    isActive: z.boolean().default(true)
});

export type UserData = z.infer<typeof UserSchema>;

export const email = z.string()
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Formato de email inválido. Ejemplo: usuario@dominio.com')
        .min(5, 'El email debe tener al menos 5 caracteres')
        .max(80, 'El email no puede exceder 80 caracteres');

const phone = z.string()
        .regex(/^\d+$/, 'El teléfono solo debe contener números')
        .min(10, 'El teléfono debe tener 10 dígitos')
        .max(10, 'El teléfono no puede exceder los 10 dígitos');

const alias = z.string()
        .regex(/^[a-zA-Z0-9_-]+$/, 'El alias solo puede contener letras, números, _ o -')
        .min(3, 'El alias debe tener al menos 3 caracteres')
        .max(30, 'El alias no puede exceder 30 caracteres');

export const identifier = z.union([alias, email, phone], "El identificador debe ser un alias, email o teléfono válido");

export const password = z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(50, 'La contraseña no puede exceder 50 caracteres')
        .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
        .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
        .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'La contraseña debe contener al menos un carácter especial');
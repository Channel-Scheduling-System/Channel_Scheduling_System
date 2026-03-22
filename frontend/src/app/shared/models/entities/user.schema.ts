import { z } from 'zod';

export const UserSchema = z.object({
    id: z.number()
        .positive('El ID debe ser un número positivo')
        .int('El ID debe ser un número entero'),
    firstName: z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres')
        .regex(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ]+$/, 'El nombre solo puede contener letras'),
    lastName: z.string()
        .min(2, 'El apellido debe tener al menos 2 caracteres')
        .max(50, 'El apellido no puede exceder 50 caracteres')
        .regex(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ]+$/, 'El apellido solo puede contener letras'),
    alias: z.string()
        .min(3, 'El alias debe tener al menos 3 caracteres')
        .max(30, 'El alias no puede exceder 30 caracteres')
        .regex(/^[a-zA-Z0-9_-]+$/, 'El alias solo puede contener letras, números, _ o -'),
    email: z.string()
        .min(5, 'El email debe tener al menos 5 caracteres')
        .max(80, 'El email no puede exceder 80 caracteres')
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Formato de email inválido. Ejemplo: usuario@dominio.com'),
    phone: z.string()
        .regex(/^\d+$/, 'El teléfono solo debe contener números')
        .min(10, 'El teléfono debe tener 10 dígitos')
        .max(10, 'El teléfono no puede exceder los 10 dígitos'),
    role: z.enum(['ADMIN', 'WORKER', 'CUSTOMER'])
});

export type UserData = z.infer<typeof UserSchema>;
import { z } from 'zod';

export const SessionSchema = z.object({
    id: z.number()
        .positive('El ID debe ser un número positivo')
        .int('El ID debe ser un número entero'),
    name: z.string()
        .regex(
            /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/,
            'El nombre solo puede contener letras y espacios'
        )
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    alias: z.string()
        .regex(/^[a-zA-Z0-9_-]+$/, 'El alias solo puede contener letras, números, guiones y guiones bajos')
        .min(3, 'El alias debe tener al menos 3 caracteres')
        .max(30, 'El alias no puede exceder 30 caracteres'),
    role: z.enum(['ADMIN', 'WORKER', 'CLIENT'])
});

export type Session = z.infer<typeof SessionSchema>;
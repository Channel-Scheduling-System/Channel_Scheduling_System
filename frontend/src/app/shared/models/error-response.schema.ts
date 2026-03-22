import { z } from 'zod';

export const ErrorResponseSchema = z.object({
  code: z.string()
    .min(3, 'El código de error debe tener al menos 3 caracteres')
    .max(30, 'El código de error no puede exceder 30 caracteres')
    .regex(/^[A-Z]+$/, 'El código de error solo debe contener letras mayúsculas'),
  message: z.string()
    .min(1, 'El mensaje de error es requerido')
    .max(300, 'El mensaje de error no puede exceder 300 caracteres')
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
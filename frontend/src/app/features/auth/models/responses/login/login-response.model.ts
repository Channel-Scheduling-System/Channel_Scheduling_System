import { z } from 'zod';
import { SuccessResponseWithDataSchema } from '../../../../../shared/models/success-response.schema';

export const SessionSchema = z.object({
  id: z.number()
    .positive('El ID debe ser un número positivo')
    .int('El ID debe ser un número entero'),
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(
      /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/,
      'El nombre solo puede contener letras y espacios'
    ),
  alias: z.string()
    .min(2, 'El alias debe tener al menos 2 caracteres')
    .max(30, 'El alias no puede exceder 30 caracteres')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'El alias solo puede contener letras, números, guiones y guiones bajos'
    )
    .optional(),
  role: z.enum(['ADMIN', 'CUSTOMER', 'CLIENT'])
});

export const LoginDataSchema = z.object({
  user: SessionSchema,
  token: z.string()
    .min(10, 'El token debe tener al menos 10 caracteres')
    .max(500, 'El token no puede exceder 500 caracteres')
    .regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
      'Formato de token JWT inválido'
    )
});

export type Session = z.infer<typeof SessionSchema>;
export type LoginData = z.infer<typeof LoginDataSchema>;
export const LoginResponseSchema = SuccessResponseWithDataSchema(LoginDataSchema);
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type SessionData = Session;
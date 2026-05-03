import { z } from 'zod';
import { SuccessResponseWithDataSchema } from '../../../../shared/models/api/success-response.schema';
import { SessionSchema } from '../../../../shared/models/entities/session.schema';

export const token = z.string()
    .min(10, 'El token debe tener al menos 10 caracteres')
    .max(500, 'El token no puede exceder 500 caracteres')
    .regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
      'Formato de token JWT inválido'
    );

export const AuthDataSchema = z.object({
  user: SessionSchema,
  token: token
});

export const AuthResponseSchema = SuccessResponseWithDataSchema(AuthDataSchema);
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
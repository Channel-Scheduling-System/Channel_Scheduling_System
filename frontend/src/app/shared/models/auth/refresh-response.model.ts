import { z } from 'zod';
import { SuccessResponseWithDataSchema } from '../api/success-response.schema';
import { SessionSchema } from '../entities/session.schema';

export const RefreshDataSchema = z.object({
    user: SessionSchema,
    token: z.string()
    .min(10, 'El token debe tener al menos 10 caracteres')
    .max(500, 'El token no puede exceder 500 caracteres')
    .regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
      'Formato de token JWT inválido'
    )
});

export type RefreshData = z.infer<typeof RefreshDataSchema>;

export const RefreshResponseSchema = SuccessResponseWithDataSchema(RefreshDataSchema);

export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;
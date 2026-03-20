import { z } from 'zod';
import { SuccessResponseWithDataSchema } from '../../../../../shared/models/success-response.schema';

export const SessionSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1),
  alias: z.string().optional(),
  role: z.enum(['ADMIN', 'CUSTOMER', 'CLIENT']),
});

export const LoginDataSchema = z.object({
  user: SessionSchema,
  token: z.string().min(1)
});

export type Session = z.infer<typeof SessionSchema>;
export type LoginData = z.infer<typeof LoginDataSchema>;
export const LoginResponseSchema = SuccessResponseWithDataSchema(LoginDataSchema);
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type SessionData = Session;
import { z } from 'zod';

export const LoginRequestSchema = z.object({
  identifier: z.string().min(6, 'El identificador debe tener al menos 6 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
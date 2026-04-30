import { z } from 'zod';
import { identifier } from '../../../../shared/models/entities/user.schema';
  
export const LoginRequestSchema = z.object({
  identifier: identifier,
  password: z.string()
    .regex(
      /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/,
      'La contraseña contiene caracteres no permitidos'
    )
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(50, 'La contraseña no puede exceder 50 caracteres')
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
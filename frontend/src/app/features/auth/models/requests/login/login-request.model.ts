import { z } from 'zod';

export const LoginRequestSchema = z.object({
  identifier: z.string()
    .min(3, 'El identificador debe tener al menos 3 caracteres')
    .max(100, 'El identificador no puede exceder 100 caracteres')
    .regex(
      /^[a-zA-Z0-9@._-]+$/,
      'El identificador solo puede contener letras, números, @, ., _ o -'
    ),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña no puede exceder 50 caracteres')
    .regex(
      /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/,
      'La contraseña contiene caracteres no permitidos'
    )
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
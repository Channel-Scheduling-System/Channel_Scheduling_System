import { z } from 'zod';
import { ROLES } from '../../../core/constants/roles.constants';
import { UserName } from './user.schema';

export const SessionSchema = z.object({
  id: z.number()
    .positive('El ID debe ser un número positivo')
    .int('El ID debe ser un número entero'),
  name: UserName,
  alias: z.string()
    .regex(/^[a-zA-Z0-9_-]+$/, 'El alias solo puede contener letras, números, guiones y guiones bajos')
    .min(3, 'El alias debe tener al menos 3 caracteres')
    .max(30, 'El alias no puede exceder 30 caracteres'),
  role: z.enum(ROLES).refine(val => ROLES.includes(val), {
    message: `El rol debe ser uno de: ${ROLES.join(', ')}`
    })
});

export type Session = z.infer<typeof SessionSchema>;
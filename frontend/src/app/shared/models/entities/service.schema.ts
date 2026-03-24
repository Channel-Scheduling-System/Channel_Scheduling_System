import { z } from 'zod';

export const ServiceSchema = z.object({
  id: z.number()
    .int('El ID debe ser un número entero')
    .positive('El ID debe ser un número positivo'),
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(
      /^[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s]+$/,
      'El nombre solo puede contener letras, números y espacios'
    ),
  description: z.string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .regex(
      /^[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s.,!?()\-]+$/,
      'La descripción contiene caracteres no permitidos'
    ),
  color: z.string()
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      'El color debe ser un código hexadecimal válido (#RRGGBB o #RGB)'
    ),
  price: z.number()
    .int('El precio debe ser un número entero')
    .positive('El precio debe ser un número positivo')
    .min(1, 'El precio mínimo es 1')
    .max(999999, 'El precio no puede exceder 999,999'),
  duration: z.number()
    .int('La duración debe ser un número entero')
    .positive('La duración debe ser un número positivo')
    .min(5, 'La duración mínima es 5 minutos')
    .max(480, 'La duración máxima es 480 minutos (8 horas)')
});

export type Service = z.infer<typeof ServiceSchema>;
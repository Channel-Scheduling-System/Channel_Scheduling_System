import { z } from 'zod';

export const SetDayOffSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (AAAA-MM-DD)'),
  reason: z
    .string()
    .max(200, 'La razón no puede exceder los 200 caracteres')
    .optional(),
});

export type SetDayOffRequest = z.infer<typeof SetDayOffSchema>;
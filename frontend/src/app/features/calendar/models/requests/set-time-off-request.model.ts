import { z } from 'zod';
import { DayOfWeek } from '../dates.model';
const baseTimeOff = {
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora de inicio inválido (HH:mm)'),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora de fin inválido (HH:mm)'),
  reason: z
    .string()
    .max(200, 'La razón no puede exceder los 200 caracteres')
    .optional(),
};
export const SetTimeOffSchema = z
  .discriminatedUnion('type', [
    z.object({
      type: z.literal('RECURRING'),
      dayOfWeek: DayOfWeek,
      ...baseTimeOff,
    }),
    z.object({
      type: z.literal('SPECIFIC'),
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (AAAA-MM-DD)'),
      ...baseTimeOff,
    }),
  ])
  .refine(
    (data) => {
      const start = data.startTime.split(':').map(Number);
      const end = data.endTime.split(':').map(Number);
      const startMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];
      return startMinutes < endMinutes;
    },
    {
      message: 'La hora de inicio debe ser menor a la hora de fin',
      path: ['endTime'], 
    }
  );
export type SetTimeOffRequest = z.infer<typeof SetTimeOffSchema>;
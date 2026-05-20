import { z } from 'zod';
import { DayOfWeek } from '../dates.model';

export const workingHourSchema = z
  .object({
    dayOfWeek: DayOfWeek,
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora de inicio inválido (HH:mm)'),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora de fin inválido (HH:mm)'),
  })
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
    
    }
  );

export type WorkingHourRequest = z.infer<typeof workingHourSchema>;
export const updateWorkingHoursRequestSchema = z.object({
  workingHours: z
    .array(workingHourSchema)
    .max(7, 'No puede haber más de 7 configuraciones (una por día)')
    .refine(
      (items) => {
        const days = items.map((i) => i.dayOfWeek);
        return new Set(days).size === days.length;
      },
      { message: 'No se permiten días duplicados en la configuración' }
    ),
});

export type UpdateWorkingHoursRequest = z.infer<typeof updateWorkingHoursRequestSchema>;
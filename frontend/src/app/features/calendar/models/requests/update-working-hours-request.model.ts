import { z } from 'zod';
import { DayOfWeek } from '../dates.model';
const toMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};
const isExactHalfHour = (timeStr: string): boolean => {
  const minutes = Number(timeStr.split(':')[1]);
  return minutes === 0 || minutes === 30;
};
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
      const startMin = toMinutes(data.startTime);
      return startMin >= 30 && startMin <= 1380; 
    },
    {
      message: 'La hora de inicio debe estar entre las 12:30am y las 11:00pm',
      path: ['startTime'],
    }
  )
  .refine(
    (data) => {
      const endMin = toMinutes(data.endTime);
      return endMin >= 60 && endMin <= 1410; 
    },
    {
      message: 'La hora de fin debe estar entre las 1:00am y las 11:30pm',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => toMinutes(data.startTime) < toMinutes(data.endTime),
    {
      message: 'La hora de inicio debe ser menor a la hora de fin',
      path: ['endTime'],
    }
  )
  .superRefine((data, ctx) => {
    const startMin = toMinutes(data.startTime);
    const endMin = toMinutes(data.endTime);
    const diff = endMin - startMin;
    const isExact = isExactHalfHour(data.startTime) && isExactHalfHour(data.endTime);
    if (isExact) {
      if (diff < 30) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Debe haber una diferencia mínima de 30 minutos entre el inicio y el fin',
          path: ['endTime'], 
        });
      }
    }
    else {
      if (diff < 60) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Debe haber una diferencia mínima de 1 hora entre el inicio y el fin si no son horarios exactos',
          path: ['endTime'], 
        });
      }
    }
  });
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
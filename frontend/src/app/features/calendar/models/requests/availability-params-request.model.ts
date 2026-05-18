import { z } from 'zod';

export const AvailabilityConfigView = z.enum(['DAY', 'WEEK', 'MONTH']);
export type AvailabilityConfigView = z.infer<typeof AvailabilityConfigView>;

export const availabilityConfigParamsRequestSchema = z.object({
  include: z
    .string()
    .transform(val => val.split(',').map(s => s.trim()))
    .pipe(
      z.array(
        z.enum(['workingHours', 'daysOff', 'timesOff', 'periodsOff'])
      ).min(1)
    ),
  view: AvailabilityConfigView,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date debe tener formato YYYY-MM-DD')
    .refine(val => !isNaN(new Date(val).getTime()), 'date no es una fecha válida'),
});

export type AvailabilityConfigParamsRequest = z.infer<typeof availabilityConfigParamsRequestSchema>;
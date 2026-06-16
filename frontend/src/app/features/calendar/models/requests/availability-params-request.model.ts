import { z } from 'zod';
import { ConfigView, dateParam } from '../../../../shared/models/entities/date.schema';

export const availabilityConfigParamsRequestSchema = z.object({
  include: z
    .string()
    .transform(val => val.split(',').map(s => s.trim()))
    .pipe(
      z.array(
        z.enum(['workingHours', 'daysOff', 'timesOff', 'periodsOff'])
      ).min(1)
    ),
  view: ConfigView,
  date: dateParam,
});
export type AvailabilityConfigParamsRequest = z.infer<typeof availabilityConfigParamsRequestSchema>;
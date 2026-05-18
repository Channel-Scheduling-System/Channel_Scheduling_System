import { z } from 'zod';
import { SuccessResponseWithDataSchema } from '../../../../shared/models/api/success-response.schema';

const Weekday = z.enum([
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
]);

const TimeString = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Debe tener formato HH:mm');

const DateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Debe tener formato YYYY-MM-DD');

export const workingHourSchema = z.object({
  weekday: Weekday,
  start: TimeString,
  end: TimeString,
});

export const dayOffSchema = z.object({
  id: z.number().int().positive(),
  date: DateString,
  reason: z.string().optional(),
});

export const recurringTimeOffSchema = z.object({
  id: z.number().int().positive(),
  weekday: Weekday,
  start: TimeString,
  end: TimeString,
  reason: z.string().optional(),
});

export const specificTimeOffSchema = z.object({
  id: z.number().int().positive(),
  date: DateString,
  start: TimeString,
  end: TimeString,
  reason: z.string().optional(),
});

export const timeOffSchema = z.object({
  recurring: z.array(recurringTimeOffSchema).optional(),
  specific: z.array(specificTimeOffSchema).optional(),
});

export const periodOffSchema = z.object({
  id: z.number().int().positive(),
  startDate: DateString,
  endDate: DateString,
  reason: z.string().optional(),
});

const availabilityConfigDataSchema = z.object({
  workingHours: z.array(workingHourSchema).optional(),
  daysOff: z.array(dayOffSchema).optional(),
  timesOff: timeOffSchema.optional(),
  periodsOff: z.array(periodOffSchema).optional(),
});

export const availabilityConfigResponseSchema = SuccessResponseWithDataSchema(
  availabilityConfigDataSchema
);

export type AvailabilityConfigResponse = z.infer<typeof availabilityConfigResponseSchema>;
export type AvailabilityConfigData = z.infer<typeof availabilityConfigDataSchema>;
export type WorkingHour = z.infer<typeof workingHourSchema>;
export type DayOff = z.infer<typeof dayOffSchema>;
export type RecurringTimeOff = z.infer<typeof recurringTimeOffSchema>;
export type SpecificTimeOff = z.infer<typeof specificTimeOffSchema>;
export type TimesOff = z.infer<typeof timeOffSchema>;
export type PeriodOff = z.infer<typeof periodOffSchema>;
export type Weekday = z.infer<typeof Weekday>;
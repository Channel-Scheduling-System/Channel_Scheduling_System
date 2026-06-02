import { z } from 'zod';
import { SuccessResponseWithDataSchema } from '../../../../shared/models/api/success-response.schema';
const TimeString = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Debe tener formato HH:mm');

const DateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Debe tener formato YYYY-MM-DD');

const availabilitySlotSchema = z.object({
  start: TimeString,
  end: TimeString,
});

const workerAvailabilityDaySchema = z.object({
  date: DateString,
  available: z.array(availabilitySlotSchema),
  occupied: z.array(availabilitySlotSchema),
});

export const workerAvailabilityResponseSchema = SuccessResponseWithDataSchema(
  z.array(workerAvailabilityDaySchema)
);

export type WorkerAvailabilityResponse = z.infer<typeof workerAvailabilityResponseSchema>;
export type WorkerAvailabilityDay = z.infer<typeof workerAvailabilityDaySchema>;
export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>;
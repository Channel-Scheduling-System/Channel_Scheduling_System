import { z } from 'zod';
import { ConfigView, dateParam } from '../../../../shared/models/entities/date.schema';

export const workerAvailabilityParamsRequestSchema = z.object({
  view: ConfigView,
  date: dateParam,
});

export type WorkerAvailabilityParamsRequest = z.infer<
  typeof workerAvailabilityParamsRequestSchema
>;
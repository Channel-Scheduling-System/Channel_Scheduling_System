import { z } from 'zod';
import { BaseSuccessResponseSchema} from '../../../../shared/models/api/success-response.schema';
export const SetPeriodOffResponseSchema = BaseSuccessResponseSchema;
export type SetPeriodOffResponse = z.infer<typeof SetPeriodOffResponseSchema>;
import { z } from 'zod';
import { BaseSuccessResponseSchema} from '../../../../shared/models/api/success-response.schema';

export const SetDayOffResponseSchema = BaseSuccessResponseSchema;

export type SetDayOffResponse = z.infer<typeof SetDayOffResponseSchema>;
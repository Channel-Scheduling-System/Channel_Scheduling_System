import { z } from 'zod';
import { BaseSuccessResponseSchema} from '../../../../shared/models/api/success-response.schema';

export const SetTimeBlockResponseSchema = BaseSuccessResponseSchema;

export type SetTimeBlockResponse = z.infer<typeof SetTimeBlockResponseSchema>;
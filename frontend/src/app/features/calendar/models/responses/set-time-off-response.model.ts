import { z } from 'zod';
import { BaseSuccessResponseSchema} from '../../../../shared/models/api/success-response.schema';

export const SetTimeOffResponseSchema = BaseSuccessResponseSchema;

export type SetTimeOffResponse = z.infer<typeof SetTimeOffResponseSchema>;
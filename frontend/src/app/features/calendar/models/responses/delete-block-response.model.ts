import { z } from 'zod';
import { BaseSuccessResponseSchema} from '../../../../shared/models/api/success-response.schema';

export const DeleteBlockResponseSchema = BaseSuccessResponseSchema;

export type DeleteBlockResponse = z.infer<typeof DeleteBlockResponseSchema>;
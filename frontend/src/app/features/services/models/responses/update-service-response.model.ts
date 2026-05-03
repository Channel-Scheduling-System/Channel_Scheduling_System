import { z } from 'zod';
import { BaseSuccessResponseSchema} from '../../../../shared/models/api/success-response.schema';

export const UpdateServiceResponseSchema = BaseSuccessResponseSchema;

export type UpdateServiceResponse = z.infer<typeof UpdateServiceResponseSchema>;
import { z } from 'zod';
import { BaseSuccessResponseSchema} from '../../../../shared/models/api/success-response.schema';

export const CreateServiceResponseSchema = BaseSuccessResponseSchema;

export type CreateServiceResponse = z.infer<typeof CreateServiceResponseSchema>;
import { z } from 'zod';
import { SuccessResponseWithDataSchema } from '../../../../shared/models/api/success-response.schema';
import { ServiceSchema } from '../../../../shared/models/entities/service.schema';

export const UpdateServiceResponseSchema = SuccessResponseWithDataSchema(ServiceSchema);

export type UpdateServiceResponse = z.infer<typeof UpdateServiceResponseSchema>;
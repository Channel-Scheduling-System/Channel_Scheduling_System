import { z } from 'zod';
import { SuccessResponseWithDataSchema } from '../../../../shared/models//api/success-response.schema';
import { ServiceSchema } from '../../../../shared/models/entities/service.schema';

export const CreateServiceResponseSchema = SuccessResponseWithDataSchema(ServiceSchema);

export type CreateServiceResponse = z.infer<typeof CreateServiceResponseSchema>;
import { z } from 'zod';
import { SuccessResponseWithDataSchema } from '../api/success-response.schema';
import { ServiceSchema } from '../entities/service.schema';

export const SingleServiceResponseSchema = SuccessResponseWithDataSchema(ServiceSchema);

export type SingleServiceResponse = z.infer<typeof SingleServiceResponseSchema>;
import { z } from 'zod';
import { BaseSuccessResponseSchema } from '../../../../shared/models/api/success-response.schema';

export const DeleteServiceResponseSchema = BaseSuccessResponseSchema;

export type DeleteServiceResponse = z.infer<typeof DeleteServiceResponseSchema>;
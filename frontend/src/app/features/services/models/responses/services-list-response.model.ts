import { z } from 'zod';
import { SuccessResponseWithDataSchema } from '../../../../shared/models/api/success-response.schema';
import { ServiceSchema } from '../../../../shared/models/entities/service.schema';

export const ServicesListDataSchema = z.array(ServiceSchema);

export type ServicesListData = z.infer<typeof ServicesListDataSchema>;

export const ServicesListResponseSchema = SuccessResponseWithDataSchema(ServicesListDataSchema);

export type ServicesListResponse = z.infer<typeof ServicesListResponseSchema>;
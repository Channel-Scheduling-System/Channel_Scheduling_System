import { z } from 'zod';
import { ServiceSchema } from '../../../../shared/models/entities/service.schema';

export const UpdateServiceRequestSchema = ServiceSchema.omit({ id: true, isActive: true });

export type UpdateServiceRequest = z.infer<typeof UpdateServiceRequestSchema>;
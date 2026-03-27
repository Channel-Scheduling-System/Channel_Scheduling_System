import { z } from 'zod';
import { ServiceSchema } from '../../../../shared/models/entities/service.schema';

export const CreateServiceRequestSchema = ServiceSchema.omit({ id: true }).extend({
  workerId: z.number()
    .int('El ID del trabajador debe ser un número entero')
    .positive('El ID del trabajador debe ser un número positivo')
});

export type CreateServiceRequest = z.infer<typeof CreateServiceRequestSchema>;
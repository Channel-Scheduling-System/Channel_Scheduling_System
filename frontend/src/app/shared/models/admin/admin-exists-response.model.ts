import { z } from 'zod';
import { BaseSuccessResponseSchema } from '../api/success-response.schema';

export const AdminExistsDataSchema = z.object({
  exists: z.boolean()
});

export type AdminExistsData = z.infer<typeof AdminExistsDataSchema>;

export const AdminExistsResponseSchema = BaseSuccessResponseSchema.extend({
  data: AdminExistsDataSchema
});

export type AdminExistsResponse = z.infer<typeof AdminExistsResponseSchema>;
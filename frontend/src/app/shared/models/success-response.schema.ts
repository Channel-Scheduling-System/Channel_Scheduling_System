// shared/models/api/success-response.schema.ts
import { z } from 'zod';

export const BaseSuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string()
});

export type BaseSuccessResponse = z.infer<typeof BaseSuccessResponseSchema>;

export const SuccessResponseWithDataSchema = <T extends z.ZodTypeAny>(dataSchema: T) => 
  BaseSuccessResponseSchema.extend({
    data: dataSchema
  });

export const SuccessResponseWithOptionalDataSchema = <T extends z.ZodTypeAny>(dataSchema: T) => 
  BaseSuccessResponseSchema.extend({
    data: dataSchema.optional()
  });

export type SuccessResponseWithData<T> = BaseSuccessResponse & { data: T };
export type SuccessResponseWithOptionalData<T> = BaseSuccessResponse & { data?: T };
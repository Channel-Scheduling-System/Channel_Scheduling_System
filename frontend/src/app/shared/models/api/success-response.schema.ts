import { z } from 'zod';

export const BaseSuccessResponseSchema = z.object({
  message: z.string()
    .min(1, 'El mensaje es requerido')
    .max(300, 'El mensaje no puede exceder 300 caracteres')
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
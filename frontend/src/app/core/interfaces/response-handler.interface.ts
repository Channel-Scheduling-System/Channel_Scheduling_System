import { z } from 'zod';

export interface IResponseHandler {
  
  handleSuccess<S extends z.ZodTypeAny>(
    response: unknown,
    schema: S
  ): z.infer<S>;

  handleSuccessWithData<T>(
    response: unknown,
    dataSchema: z.ZodTypeAny
  ): T;

  handleSuccessWithoutData(response: unknown): void;
}
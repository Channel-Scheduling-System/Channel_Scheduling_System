import { z } from 'zod';

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string()
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
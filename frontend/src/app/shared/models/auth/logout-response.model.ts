import { z } from 'zod';
import { BaseSuccessResponseSchema } from '../api/success-response.schema';

export const LogoutResponseSchema = BaseSuccessResponseSchema;

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
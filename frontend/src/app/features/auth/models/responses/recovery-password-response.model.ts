import { z } from 'zod';
import { BaseSuccessResponseSchema } from '../../../../shared/models/api/success-response.schema';

export const PasswordRecoveryResponseSchema = BaseSuccessResponseSchema;

export type PasswordRecoveryResponse = z.infer<typeof PasswordRecoveryResponseSchema>;
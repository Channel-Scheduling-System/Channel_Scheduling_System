import { z } from 'zod';
import { BaseSuccessResponseSchema } from '../../../../shared/models/api/success-response.schema';
import { token } from './auth-response.model';

export const SendRecoveryCodeResponseSchema = BaseSuccessResponseSchema;

export type SendRecoveryCodeResponse = z.infer<typeof SendRecoveryCodeResponseSchema>;
import { z } from 'zod';
import { BaseSuccessResponseSchema } from '../../../../shared/models/api/success-response.schema';
import { token } from './auth-response.model';

export const VerifyRecoveryCodeResponseSchema = BaseSuccessResponseSchema.extend({
    resetToken: token
});

export type VerifyRecoveryCodeResponse = z.infer<typeof VerifyRecoveryCodeResponseSchema>;
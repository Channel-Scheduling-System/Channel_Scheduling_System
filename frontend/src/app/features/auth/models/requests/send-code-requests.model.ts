import { z } from 'zod';
import { email } from '../../../../shared/models/entities/user.schema';

export const SendRecoveryCodeRequestSchema = z.object({
    email: email
});

export type SendRecoveryCodeRequest = z.infer<typeof SendRecoveryCodeRequestSchema>;
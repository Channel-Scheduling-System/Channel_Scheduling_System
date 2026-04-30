import { z } from 'zod';
import { password } from '../../../../shared/models/entities/user.schema';

export const PasswordRecoveryRequestSchema = z.object({
    newPassword: password
});

export type PasswordRecoveryRequest = z.infer<typeof PasswordRecoveryRequestSchema>;
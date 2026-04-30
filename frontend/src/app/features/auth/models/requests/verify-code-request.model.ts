import { z } from 'zod';
import { email } from '../../../../shared/models/entities/user.schema';

export const VerifyRecoveryCodeRequestSchema = z.object({
    email: email,
    code: z.string()
        .min(6, 'El código debe tener al menos 6 caracteres')
        .max(6, 'El código no puede tener más de 6 caracteres')
        .regex(/^\d+$/, 'El código debe contener solo dígitos'),
});

export type VerifyRecoveryCodeRequest = z.infer<typeof VerifyRecoveryCodeRequestSchema>;
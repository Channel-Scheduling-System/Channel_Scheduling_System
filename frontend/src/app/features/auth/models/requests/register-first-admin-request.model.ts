import { z } from 'zod';
import { password, UserSchema } from '../../../../shared/models/entities/user.schema';

const FirstAdminRegistrationFields = UserSchema.omit({ id: true, role: true, isActive: true });
export const RegisterFirstAdminRequestSchema = FirstAdminRegistrationFields.extend({
    password: password,
    secretCode: z.string()
        .min(6, 'El código secreto debe tener al menos 6 caracteres')
        .max(20, 'El código secreto no puede exceder 20 caracteres')

});

export type RegisterFirstAdminRequest = z.infer<typeof RegisterFirstAdminRequestSchema>;
import { z } from 'zod';
import { password, UserSchema } from '../../../../shared/models/entities/user.schema';

const UserRegistrationFields = UserSchema.omit({ id: true, isActive: true});

export const RegisterUserRequestBaseSchema = UserRegistrationFields.extend({
    password: password
});

export type RegisterUserRequest = z.infer<typeof RegisterUserRequestBaseSchema>;
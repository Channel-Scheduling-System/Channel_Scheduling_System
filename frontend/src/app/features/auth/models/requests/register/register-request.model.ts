import { z } from 'zod';
import { UserSchema } from '../../../../../shared/models/entities/user.schema';

const UserRegistrationFields = UserSchema.omit({ id: true, role: true });
export const RegisterRequestBaseSchema = UserRegistrationFields.extend({
    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(50, 'La contraseña no puede exceder 50 caracteres')
        .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
        .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
        .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'La contraseña debe contener al menos un carácter especial')
});

export const CustomerRegisterRequestSchema = RegisterRequestBaseSchema.extend({
    role: z.literal('CLIENT')
});

export const WorkerRegisterRequestSchema = RegisterRequestBaseSchema.extend({
    role: z.literal('WORKER')
});

export const AdminRegisterRequestSchema = RegisterRequestBaseSchema.extend({
    role: z.literal('ADMIN')
});

export type RegisterRequest = z.infer<typeof RegisterRequestBaseSchema>;
export type CustomerRegisterRequest = z.infer<typeof CustomerRegisterRequestSchema>;
export type WorkerRegisterRequest = z.infer<typeof WorkerRegisterRequestSchema>;
export type AdminRegisterRequest = z.infer<typeof AdminRegisterRequestSchema>;
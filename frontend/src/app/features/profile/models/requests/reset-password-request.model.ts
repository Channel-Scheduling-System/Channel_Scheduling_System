import z from "zod";

export const ResetUserPasswordRequestSchema = z.object({
    password: z.string()
        .regex(
            /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/,
            'La contraseña contiene caracteres no permitidos'
        )
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(50, 'La contraseña no puede exceder 50 caracteres'),
    newPassword: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(50, 'La contraseña no puede exceder 50 caracteres')
        .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
        .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
        .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'La contraseña debe contener al menos un carácter especial')
});

export type ResetUserPasswordRequest = z.infer<typeof ResetUserPasswordRequestSchema>;
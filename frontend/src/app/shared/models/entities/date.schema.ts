import z from "zod";

export const dateParam = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date debe tener formato YYYY-MM-DD')
    .refine(val => !isNaN(new Date(val).getTime()), 'No es una fecha válida');

export const DateOnlySchema = dateParam;
export type DateOnly = z.infer<typeof DateOnlySchema>;

export const ConfigView = z.enum(['DAY', 'WEEK', 'MONTH']);
export type ConfigView = z.infer<typeof ConfigView>;
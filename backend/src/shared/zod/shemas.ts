import { z } from 'zod';

export const Id = z
    .number('El id debe ser un número')
    .int('El ID debe ser un número entero')
    .positive('El ID debe ser un número positivo');

export const oneOrMany = <T extends z.ZodTypeAny>(schema: T) =>
    z.preprocess(
        (val) =>
            val === undefined ? undefined : Array.isArray(val) ? val : [val],
        z.array(schema).optional(),
    );

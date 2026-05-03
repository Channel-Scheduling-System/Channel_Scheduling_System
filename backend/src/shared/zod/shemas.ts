import { z } from 'zod';

// Esquemas comunes
//* ------------------

export const Id = z
    .number('El id debe ser un número')
    .int('El ID debe ser un número entero')
    .positive('El ID debe ser un número positivo');

export const UpdateStateDTO = z.object({
    isActive: z.boolean(),
}).strict();

// Función zod para validar un valor que puede ser un solo elemento o un array de elementos

export const oneOrMany = <T extends z.ZodTypeAny>(schema: T) =>
    z.preprocess(
        (val) =>
            val === undefined ? undefined : Array.isArray(val) ? val : [val],
        z.array(schema).optional(),
    );

import { z } from 'zod';

// ============================================================
// * PRIMITIVOS: IDs
// ============================================================
export const paramId = z.object({
    id: z.coerce
        .number('El id debe ser un número')
        .int('El id debe ser un número entero')
        .positive('El id debe ser un número positivo'),
});

export const id = z
    .number('El id debe ser un número')
    .int('El ID debe ser un número entero')
    .positive('El ID debe ser un número positivo');

export const workerId = z
    .number('El id del trabajador debe ser un número')
    .int('El ID del trabajador debe ser un número entero')
    .positive('El ID del trabajador debe ser un número positivo');

// ============================================================
// * DTOS COMUNES
// ============================================================
export const updateStateDTO = z
    .object({
        isActive: z.boolean(),
    })
    .strict();

// ============================================================
// * TEMPORAL SCHEMAS
// ============================================================
export const dateSchema = z.iso.date();

export const timeSchema = z.iso.time({ precision: -1 });

// ============================================================
// * HELPERS DE VALIDACIÓN DE RANGOS
// ============================================================
/**
 * Valida que startTime < endTime (ambos obligatorios)
 */
export const validateTimeRange = (data: {
    startTime: string;
    endTime: string;
}): boolean => data.startTime < data.endTime;

// ============================================================
// * UTILIDADES: Helpers reutilizables
// ============================================================
// Función zod para validar un valor que puede ser un solo elemento o un array de elementos
export const oneOrMany = <T extends z.ZodTypeAny>(schema: T) =>
    z.preprocess(
        (val) =>
            val === undefined ? undefined : Array.isArray(val) ? val : [val],
        z.array(schema).optional(),
    );

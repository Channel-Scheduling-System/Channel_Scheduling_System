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

export const queryId = (type: string) =>
    z.coerce
        .number(`El ${type}Id debe ser un número`)
        .int(`El ${type}Id debe ser un número entero`)
        .positive(`El ${type}Id debe ser un número positivo`);

export const id = z
    .number('El id debe ser un número')
    .int('El ID debe ser un número entero')
    .positive('El ID debe ser un número positivo');

export const workerId = z
    .number('El id del trabajador debe ser un número')
    .int('El ID del trabajador debe ser un número entero')
    .positive('El ID del trabajador debe ser un número positivo');

export const clientId = z
    .number('El id del cliente debe ser un número')
    .int('El ID del cliente debe ser un número entero')
    .positive('El ID del cliente debe ser un número positivo');

// ============================================================
// * SCHEMAS COMUNES
// ============================================================
export const pageSchema = z.coerce
    .number()
    .positive('Page debe ser un número positivo');

export const limitSchema = (limit: number) =>
    z.coerce
        .number()
        .positive('Limit debe ser un número positivo')
        .max(limit, `El límite máximo es ${limit} registros`);

export const priceSchema = z
    .number('El precio debe ser un número')
    .int('El precio debe ser un número entero')
    .positive('El precio debe ser un número positivo')
    .max(999999, 'El precio no puede exceder 999.999');

export const durationSchema = z
    .number('La duración debe ser un número')
    .int('La duración debe ser un número entero')
    .positive('La duración debe ser un número positivo')
    .min(10, 'La duración mínima es 10 minutos')
    .max(500, 'La duración máxima es 500 minutos');

// ============================================================
// * TEMPORAL SCHEMAS
// ============================================================
export const dateSchema = z.iso.date();

export const timeSchema = z.iso.time({ precision: -1 });

export const dateTimeSchema = z.iso.datetime({ precision: -1 });

// ============================================================
// * DTOS COMUNES
// ============================================================
export const updateStateDTO = z
    .object({
        isActive: z.boolean(),
    })
    .strict();

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

/**
 * Valida que startDate <= endDate (ambos obligatorios)
 */
export const validateDateRange = (data: {
    startDate: string;
    endDate: string;
}): boolean => data.startDate < data.endDate;

// ============================================================
// * UTILIDADES: Helpers reutilizables
// ============================================================
// Función zod para validar un valor que puede ser un solo elemento o un array de elementos
export const oneOrMany = <T extends z.ZodTypeAny>(schema: T) =>
    z.preprocess((val) => {
        if (val === undefined) return undefined;
        const values = Array.isArray(val) ? val : [val];
        return values.flatMap((item) =>
            typeof item === 'string'
                ? item.split(',').map((v) => v.trim())
                : item,
        );
    }, z.array(schema).optional());

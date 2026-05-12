import { z } from 'zod';
import {
    validateBodyDTO,
    validateParamsDTO,
    validateQueryDTO,
} from '../../shared/middlewares/validateDTO.middleware.js';
import {
    id,
    paramId,
    updateStateDTO,
    workerId,
} from '../../shared/zod/shemas.js';

// SERVICES
//* -----------------------------
const serviceSchema = z.object({
    id: id,
    workerId: workerId,
    name: z
        .string()
        .regex(
            /^[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s]+$/,
            'El nombre solo puede contener letras, números y espacios',
        )
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    description: z
        .string()
        .regex(
            /^[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s.,!?()-]+$/,
            'La descripción contiene caracteres no permitidos',
        )
        .min(10, 'La descripción debe tener al menos 10 caracteres')
        .max(500, 'La descripción no puede exceder 500 caracteres'),
    color: z
        .string()
        .regex(
            /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
            'El color debe ser un código hexadecimal válido (#RRGGBB o #RGB)',
        ),
    price: z
        .number('El precio debe ser un número')
        .int('El precio debe ser un número entero')
        .positive('El precio debe ser un número positivo')
        .min(1, 'El precio mínimo es 1')
        .max(999999, 'El precio no puede exceder 999,999'),
    duration: z
        .number('La duración debe ser un número')
        .int('La duración debe ser un número entero')
        .positive('La duración debe ser un número positivo')
        .min(5, 'La duración mínima es 5 minutos')
        .max(300, 'La duración máxima es 300 minutos'),
});

// TYPES (DTOs)
//* -----------------------------
const createServiceDTO = serviceSchema.omit({ id: true }).strict();

const updateServiceDTO = serviceSchema
    .partial()
    .omit({ workerId: true })
    .strict();

// FILTERS
export const serviceFiltersSchema = z
    .object({
        workerId: z.coerce.number().int().positive().optional(),
        isActive: z.union([z.boolean(), z.stringbool()]).optional(),
    })
    .strict();

// Export centralizado
//* -----------------------------
export const serviceValidator = {
    id: validateParamsDTO(paramId),
    create: validateBodyDTO(createServiceDTO),
    update: validateBodyDTO(updateServiceDTO),
    updateState: validateBodyDTO(updateStateDTO),
    filters: validateQueryDTO(serviceFiltersSchema),
};

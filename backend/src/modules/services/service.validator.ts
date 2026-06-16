import { z } from 'zod';
import {
    validateBodyDTO,
    validateParamsDTO,
    validateQueryDTO,
} from '../../shared/middlewares/validateDTO.middleware.js';
import {
    id,
    workerId,
    paramId,
    priceSchema,
    durationSchema,
    updateStateDTO,
} from '../../shared/zod/schemas.js';

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
        .max(500, 'La descripción no puede exceder 500 caracteres')
        .optional(),
    color: z
        .string()
        .regex(
            /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
            'El color debe ser un código hexadecimal válido (#RRGGBB o #RGB)',
        ),
    price: priceSchema,
    duration: durationSchema,
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

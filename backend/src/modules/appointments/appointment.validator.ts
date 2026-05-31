import {
    validateBodyDTO,
    validateParamsDTO,
    validateQueryDTO,
} from '../../shared/middlewares/validateDTO.middleware.js';
import {
    paramId,
    id,
    workerId,
    clientId,
    dateTimeSchema,
    pageSchema,
    priceSchema,
    durationSchema,
    limitSchema,
} from '../../shared/zod/shemas.js';
import { Status } from './appointment.types.js';
import { z } from 'zod';

// ============================================================
// * BASE SCHEMAS
// ============================================================
const statusEnum = z.enum(Status);

const notesSchema = z.string().max(300).optional();

const appointmentSchema = z.object({
    workerId: workerId,
    clientId: clientId,
    startAt: dateTimeSchema,
    notes: notesSchema,
});

const appointmentServiceSchema = z.object({
    serviceId: id,
    customDurationMin: durationSchema,
    customPrice: priceSchema,
});

// ============================================================
// * INPUT DTOs
// ============================================================
const verifyOverlapInput = z
    .object({
        workerId: workerId,
        startAt: dateTimeSchema,
        services: z
            .array(
                z.object({ serviceId: id, customDurationMin: durationSchema }),
            )
            .min(1, 'Debe proporcionar al menos un servicio')
            .max(5, 'No puede proporcionar más de 5 servicios'),
    })
    .strict();

const createAppointmentInput = appointmentSchema
    .extend({
        services: z
            .array(appointmentServiceSchema)
            .min(1, 'Debe proporcionar al menos un servicio'),
    })
    .strict();

const updateAppointmentInput = z
    .object({
        startAt: dateTimeSchema.optional(),
        notes: notesSchema,
        services: z
            .array(appointmentServiceSchema)
            .min(1, 'Debe proporcionar al menos un servicio')
            .optional(),
    })
    .strict();

const rescheduleAppointmentInput = z
    .object({
        startAt: dateTimeSchema,
        services: z.array(z.object({ serviceId: id })).optional(),
    })
    .strict();

const rejectAppointmentInput = z
    .object({
        reason: z.string().max(300).optional(),
    })
    .strict();

const changeAppointmentStatusInput = z
    .object({
        status: statusEnum.refine(
            (status) => !['PENDING', 'REJECTED', 'SCHEDULED'].includes(status),
            { message: 'El estado no puede ser PENDING, REJECTED o SCHEDULED' },
        ),
    })
    .strict();

// ============================================================
// * FILTER SCHEMAS
// ============================================================
const appointmentFilters = z.object({
    workerId: workerId.optional(),
    clientId: clientId.optional(),
    status: statusEnum.optional(),
    from: dateTimeSchema.optional(),
    to: dateTimeSchema.optional(),
});

const paginationSchema = z.object({
    page: pageSchema.optional(),
    limit: limitSchema(100).optional(),
});

const appointmentQuerySchema = appointmentFilters.and(paginationSchema);

// ============================================================
// * CENTRALIZED VALIDATORS
// ============================================================
export const appointmentValidator = {
    id: validateParamsDTO(paramId),
    verifyOverlap: validateBodyDTO(verifyOverlapInput),
    create: validateBodyDTO(createAppointmentInput),
    update: validateBodyDTO(updateAppointmentInput),
    reschedule: validateBodyDTO(rescheduleAppointmentInput),
    reject: validateBodyDTO(rejectAppointmentInput),
    changeStatus: validateBodyDTO(changeAppointmentStatusInput),
    filters: validateQueryDTO(appointmentQuerySchema),
};

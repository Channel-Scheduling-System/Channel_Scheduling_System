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
    oneOrMany,
    dateSchema,
    queryId,
} from '../../shared/zod/schemas.js';
import { Status } from './appointment.types.js';
import { z } from 'zod';

// ============================================================
// * BASE SCHEMAS
// ============================================================
const viewTypeEnum = z.enum(['DAY', 'WEEK', 'MONTH']);

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
    customDuration: durationSchema,
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
            .array(z.object({ serviceId: id, customDuration: durationSchema }))
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

const cancelAppointmentInput = z
    .object({
        reason: z.string().max(300).optional(),
    })
    .strict();

const allowedChangeStatus = ['IN_PROGRESS', 'COMPLETED', 'NO_SHOW'];
const changeAppointmentStatusInput = z
    .object({
        status: statusEnum.refine(
            (status) => allowedChangeStatus.includes(status),
            { message: 'Estados válidos: IN_PROGRESS, COMPLETED, NO_SHOW' },
        ),
    })
    .strict();

// ============================================================
// * FILTER SCHEMAS
// ============================================================
const appointmentFilters = z.object({
    workerId: queryId('worker').optional(),
    clientId: queryId('client').optional(),
    status: oneOrMany(statusEnum),
    from: dateSchema.optional(),
    to: dateSchema.optional(),
});

const paginationSchema = z.object({
    page: pageSchema.optional(),
    limit: limitSchema(50).optional(),
});

export const appointmentHistoryFilterSchema =
    appointmentFilters.and(paginationSchema);

export const appointmentCalendarFilterSchema = z.object({
    view: viewTypeEnum,
    date: dateSchema,
    workerId: queryId('worker').optional(),
    clientId: queryId('client').optional(),
});

export const countFilterSchema = z.object({
    workerId: queryId('worker').optional(),
    clientId: queryId('client').optional(),
    status: oneOrMany(statusEnum),
});

// ============================================================
// * CENTRALIZED VALIDATORS
// ============================================================
export const appointmentValidator = {
    id: validateParamsDTO(paramId),
    verifyOverlap: validateBodyDTO(verifyOverlapInput),
    create: validateBodyDTO(createAppointmentInput),
    update: validateBodyDTO(updateAppointmentInput),
    reschedule: validateBodyDTO(rescheduleAppointmentInput),
    cancel: validateBodyDTO(cancelAppointmentInput),
    changeStatus: validateBodyDTO(changeAppointmentStatusInput),
    historyFilters: validateQueryDTO(appointmentHistoryFilterSchema),
    calendarFilters: validateQueryDTO(appointmentCalendarFilterSchema),
    countFilters: validateQueryDTO(countFilterSchema),
};

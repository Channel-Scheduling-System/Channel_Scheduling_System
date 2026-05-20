import {
    validateBodyDTO,
    validateParamsDTO,
    validateQueryDTO,
} from '../../shared/middlewares/validateDTO.middleware.js';
import {
    id,
    workerId,
    dateSchema,
    timeSchema,
    validateTimeRange,
    validateDateRange,
    paramId,
    oneOrMany,
} from '../../shared/zod/shemas.js';
import { dayOfWeek } from './availability.types.js';
import { z } from 'zod';

// ============================================================
// * BASE SCHEMAS
// ============================================================
export const dayOfWeekEnum = z.enum(dayOfWeek);

export const viewTypeEnum = z.enum(['DAY', 'WEEK', 'MONTH']);

export const availabilityTypeEnum = z.enum([
    'workingHours',
    'timesOff',
    'daysOff',
    'periodsOff',
]);

export const workingHourSchema = z.object({
    id: id,
    workerId: workerId,
    dayOfWeek: dayOfWeekEnum,
    startTime: timeSchema,
    endTime: timeSchema,
});

// ============================================================
// * INPUT DTOs
// ============================================================
export const createWorkHourInput = z
    .object({
        workingHours: z
            .array(
                workingHourSchema
                    .omit({ id: true, workerId: true })
                    .refine(validateTimeRange, {
                        message:
                            'La hora de inicio debe ser menor a la hora de fin',
                    }),
            )
            .min(1, 'Debe proporcionar al menos un horario de trabajo'),
    })
    .strict();

export const createSpecificTimeOffInput = z
    .object({
        type: z.literal('SPECIFIC'),
        date: dateSchema,
        startTime: timeSchema,
        endTime: timeSchema,
        reason: z.string().max(200).optional(),
    })
    .refine(validateTimeRange, {
        message: 'La hora de inicio debe ser menor a la hora de fin',
    });

export const createRecurringTimeOffInput = z
    .object({
        type: z.literal('RECURRING'),
        dayOfWeek: dayOfWeekEnum,
        startTime: timeSchema,
        endTime: timeSchema,
        reason: z.string().max(200).optional(),
    })
    .refine(validateTimeRange, {
        message: 'La hora de inicio debe ser menor a la hora de fin',
    });

export const createTimeOffInput = z.discriminatedUnion('type', [
    createSpecificTimeOffInput,
    createRecurringTimeOffInput,
]);

export const createDayOffInput = z.object({
    date: dateSchema,
    reason: z.string().max(200).optional(),
});

export const createPeriodOffInput = z
    .object({
        startDate: dateSchema,
        endDate: dateSchema,
        reason: z.string().max(200).optional(),
    })
    .refine(validateDateRange, {
        message: 'La fecha de inicio debe ser menor a la fecha de fin',
    });

// ============================================================
// * FILTER SCHEMAS
// ============================================================
export const availabilityWorkerFilters = z.object({
    include: oneOrMany(availabilityTypeEnum),
    view: viewTypeEnum.optional(),
    date: dateSchema.optional(),
});

// ============================================================
// * CENTRALIZED VALIDATORS
// ============================================================
export const availabilityValidator = {
    id: validateParamsDTO(paramId),
    createWorkHour: validateBodyDTO(createWorkHourInput),
    createTimeOff: validateBodyDTO(createTimeOffInput),
    createDayOff: validateBodyDTO(createDayOffInput),
    createPeriodOff: validateBodyDTO(createPeriodOffInput),
    workerFilters: validateQueryDTO(availabilityWorkerFilters),
};

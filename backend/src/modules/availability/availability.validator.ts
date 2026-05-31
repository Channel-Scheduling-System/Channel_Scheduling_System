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
const dayOfWeekEnum = z.enum(dayOfWeek);

const viewTypeEnum = z.enum(['DAY', 'WEEK', 'MONTH']);

const availabilityTypeEnum = z.enum([
    'workingHours',
    'timesOff',
    'daysOff',
    'periodsOff',
]);

const workingHourSchema = z.object({
    id: id,
    workerId: workerId,
    dayOfWeek: dayOfWeekEnum,
    startTime: timeSchema,
    endTime: timeSchema,
});

// ============================================================
// * INPUT DTOs
// ============================================================
const createWorkHourInput = z
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

const createSpecificTimeOffInput = z
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

const createRecurringTimeOffInput = z
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

const createTimeOffInput = z.discriminatedUnion('type', [
    createSpecificTimeOffInput,
    createRecurringTimeOffInput,
]);

const createDayOffInput = z.object({
    date: dateSchema,
    reason: z.string().max(200).optional(),
});

const createPeriodOffInput = z
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

const availabilityClientFilters = z.object({
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
    clientFilters: validateQueryDTO(availabilityClientFilters),
};

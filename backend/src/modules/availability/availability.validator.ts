import {
    validateBodyDTO,
    validateParamsDTO,
} from '../../shared/middlewares/validateDTO.middleware.js';
import {
    id,
    workerId,
    timeSchema,
    validateTimeRange,
    paramId,
} from '../../shared/zod/shemas.js';
import { dayOfWeek } from './availability.types.js';
import { z } from 'zod';

// ============================================================
// * BASE SCHEMAS
// ============================================================
export const dayOfWeekEnum = z.enum(dayOfWeek);

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
                        message: 'La hora de inicio debe ser menor a la hora de fin',
                    }),
            )
            .min(1, 'Debe proporcionar al menos un horario de trabajo'),
    })
    .strict();

// ============================================================
// * FILTER SCHEMAS
// ============================================================


// ============================================================
// * CENTRALIZED VALIDATORS
// ============================================================
export const availabilityValidator = {
    id: validateParamsDTO(paramId),
    createWorkHour: validateBodyDTO(createWorkHourInput),
};

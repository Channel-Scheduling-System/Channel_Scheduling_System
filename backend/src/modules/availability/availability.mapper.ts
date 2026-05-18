import {
    isoDateToDateTime,
    isoTimeToDateTime,
} from '../../shared/utils/iso-to-datetime.util.js';
import {
    CreateWorkingHoursInput,
    CreateWorkingHourData,
    dayOfWeek,
    CreateBlockedTimeData,
    CreateDayOffInput,
    CreatePeriodOffInput,
} from './availability.types.js';

// Mapeo entre strings (API) y números (BD)
export const dayOfWeekToNumber: Record<dayOfWeek, number> = {
    [dayOfWeek.MONDAY]: 1,
    [dayOfWeek.TUESDAY]: 2,
    [dayOfWeek.WEDNESDAY]: 3,
    [dayOfWeek.THURSDAY]: 4,
    [dayOfWeek.FRIDAY]: 5,
    [dayOfWeek.SATURDAY]: 6,
    [dayOfWeek.SUNDAY]: 7,
};

export const numberToDayOfWeek: Record<number, dayOfWeek> = {
    1: dayOfWeek.MONDAY,
    2: dayOfWeek.TUESDAY,
    3: dayOfWeek.WEDNESDAY,
    4: dayOfWeek.THURSDAY,
    5: dayOfWeek.FRIDAY,
    6: dayOfWeek.SATURDAY,
    7: dayOfWeek.SUNDAY,
};

/**
 * Mapea el input de creación de horarios a un formato adecuado para la base de datos.
 * @param input - El input de creación de horarios.
 * @returns Un array de objetos con la información necesaria para crear los horarios en la base de datos.
 */
export function mapToCreateWorkingHoursData(
    input: CreateWorkingHoursInput,
): CreateWorkingHourData[] {
    return input.workingHours.map((wh) => ({
        workerId: input.workerId,
        dayOfWeek: dayOfWeekToNumber[wh.dayOfWeek],
        startTime: isoTimeToDateTime(wh.startTime),
        endTime: isoTimeToDateTime(wh.endTime),
    }));
}

/**
 * Mapea el input de creación de día libre a un formato adecuado para la base de datos.
 * @param input - El input de creación de día libre.
 * @returns Un objeto con la información necesaria para crear el día libre en la base de datos.
 */
export function mapToCreateDayOffData(
    input: CreateDayOffInput,
): CreateBlockedTimeData {
    return {
        workerId: input.workerId,
        type: 'DAY',
        startDate: isoDateToDateTime(input.date),
        reason: input.reason,
    };
}

export function mapToCreatePeriodOffData(
    input: CreatePeriodOffInput,
): CreateBlockedTimeData {
    return {
        workerId: input.workerId,
        type: 'PERIOD',
        startDate: isoDateToDateTime(input.startDate),
        endDate: isoDateToDateTime(input.endDate),
        reason: input.reason,
    };
}

import {
    CreateWorkingHoursInput,
    CreateWorkingHourData,
    dayOfWeek,
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
        startTime: wh.startTime,
        endTime: wh.endTime,
    }));
}

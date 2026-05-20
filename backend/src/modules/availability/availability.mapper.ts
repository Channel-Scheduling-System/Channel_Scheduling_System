import {
    dateTimeToIsoDate,
    dateTimeToIsoTime,
    isoDateToDateTime,
    isoTimeToDateTime,
} from '../../shared/utils/iso-to-datetime.util.js';
import {
    CreateWorkingHoursInput,
    CreateWorkingHourData,
    dayOfWeek,
    CreateBlockedTimeData,
    CreateDayOffInput,
    CreateTimeOffInput,
    CreatePeriodOffInput,
    WorkingHourResponse,
    WorkingHour,
    BlockedTime,
    DayOffResponse,
    PeriodOffResponse,
    RecurringTimeOffResponse,
    SpecificTimeOffResponse,
    AvailabilityWorkerFilter,
} from './availability.types.js';
import { availabilityWorkerFilters } from './availability.validator.js';

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

export function mapToCreateTimeOffData(
    input: CreateTimeOffInput,
): CreateBlockedTimeData {
    if (input.type === 'RECURRING') {
        return {
            workerId: input.workerId,
            type: 'HOUR',
            startDate: '1900-01-01T00:00:00Z', // Placeholder con formato DateTime
            startTime: isoTimeToDateTime(input.startTime),
            endTime: isoTimeToDateTime(input.endTime),
            dayOfWeek: dayOfWeekToNumber[input.dayOfWeek],
            reason: input.reason,
        };
    } else {
        // SPECIFIC
        return {
            workerId: input.workerId,
            type: 'HOUR',
            startDate: isoDateToDateTime(input.date),
            startTime: isoTimeToDateTime(input.startTime),
            endTime: isoTimeToDateTime(input.endTime),
            reason: input.reason,
        };
    }
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

export function mapToWorkingHourResponse(wh: WorkingHour): WorkingHourResponse {
    return {
        dayOfWeek: numberToDayOfWeek[wh.dayOfWeek],
        startTime: dateTimeToIsoTime(wh.startTime.toISOString()),
        endTime: dateTimeToIsoTime(wh.endTime.toISOString()),
    };
}

export function mapToRecurringTimeOffResponse(
    block: BlockedTime,
): RecurringTimeOffResponse {
    return {
        id: block.id,
        dayOfWeek: block.dayOfWeek
            ? numberToDayOfWeek[block.dayOfWeek]
            : dayOfWeek.MONDAY,
        startTime: block.startTime
            ? dateTimeToIsoTime(block.startTime.toISOString())
            : '00:00:00',
        endTime: block.endTime
            ? dateTimeToIsoTime(block.endTime.toISOString())
            : '00:00:00',
        reason: block.reason || undefined,
    };
}

export function mapToSpecificTimeOffResponse(
    block: BlockedTime,
): SpecificTimeOffResponse {
    return {
        id: block.id,
        date: dateTimeToIsoDate(block.startDate.toISOString()),
        startTime: block.startTime
            ? dateTimeToIsoTime(block.startTime.toISOString())
            : '00:00:00',
        endTime: block.endTime
            ? dateTimeToIsoTime(block.endTime.toISOString())
            : '00:00:00',
        reason: block.reason || undefined,
    };
}

export function mapToDaysOffResponse(block: BlockedTime): DayOffResponse {
    return {
        id: block.id,
        date: dateTimeToIsoDate(block.startDate.toISOString()),
        reason: block.reason || undefined,
    };
}

export function mapToPeriodOffResponse(block: BlockedTime): PeriodOffResponse {
    return {
        id: block.id,
        startDate: dateTimeToIsoDate(block.startDate.toISOString()),
        endDate: block.endDate
            ? dateTimeToIsoDate(block.endDate.toISOString())
            : '',
        reason: block.reason || undefined,
    };
}

export function mapToAvailabilityWorkerFilter(
    workerId: number,
    filters: Partial<Omit<AvailabilityWorkerFilter, 'workerId'>> = {},
): AvailabilityWorkerFilter {
    const parseFilters = availabilityWorkerFilters.parse(filters);
    return {
        workerId,
        include: parseFilters.include,
        view: parseFilters.view,
        date: parseFilters.date,
    };
}

export enum dayOfWeek {
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
    SUNDAY = 'SUNDAY',
}

export type TimeInterval = 'HOUR' | 'DAY' | 'PERIOD';
export type ViewType = 'DAY' | 'WEEK' | 'MONTH';
export type AvailabilityType =
    | 'workingHours'
    | 'timeOffs'
    | 'dayOffs'
    | 'periodOffs';

// ============================================================
// * ENTITIES
// ============================================================
export interface WorkingHour {
    id: number;
    workerId: number;
    dayOfWeek: number;
    startTime: Temporal.PlainTime;
    endTime: Temporal.PlainTime;
}

// ============================================================
// * PERSISTENCE MODELS
// ============================================================
export interface CreateWorkingHourData {
    workerId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

// ============================================================
// * INPUTs
// ============================================================
export interface WorkingHourInput {
    dayOfWeek: dayOfWeek;
    startTime: string; // ISO time string
    endTime: string; // ISO time string
}

export interface CreateWorkingHoursInput {
    workerId: number;
    workingHours: WorkingHourInput[];
}

// ============================================================
// * RESPONSES
// ============================================================
export interface WorkingHourResponse {
    dayOfWeek: dayOfWeek;
    startTime: string; // ISO time string
    endTime: string; // ISO time string
}

// ============================================================
// * FILTERS
// ============================================================

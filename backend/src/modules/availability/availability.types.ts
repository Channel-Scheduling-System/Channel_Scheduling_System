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

export interface BlockedTime {
    id: number;
    workerId: number;
    type: TimeInterval;
    startDate: Date;
    endDate: Date | null;
    startTime: Date | null;
    endTime: Date | null;
    reason: string | null;
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

export interface CreateBlockedTimeData {
    workerId: number;
    type: TimeInterval;
    startDate: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    reason?: string;
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

export interface CreateDayOffInput {
    workerId: number;
    date: string; // ISO date string
    reason?: string;
}

export interface CreatePeriodOffInput {
    workerId: number;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    reason?: string;
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

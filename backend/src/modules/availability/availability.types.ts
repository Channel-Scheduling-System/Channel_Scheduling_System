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

export type CreateTimeOffInput =
    | {
          workerId: number;
          type: 'RECURRING';
          dayOfWeek: dayOfWeek;
          startTime: string;
          endTime: string;
          reason?: string;
      }
    | {
          workerId: number;
          type: 'SPECIFIC';
          date: string;
          startTime: string;
          endTime: string;
          reason?: string;
      };

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

export interface RecurringTimeOffResponse {
    id: number;
    dayOfWeek: dayOfWeek;
    startTime: string; // ISO time string
    endTime: string; // ISO time string
    reason?: string;
}

export interface SpecificTimeOffResponse {
    id: number;
    date: string; // ISO date string
    startTime: string; // ISO time string
    endTime: string; // ISO time string
    reason?: string;
}

export interface DayOffResponse {
    id: number;
    date: string; // ISO date string
    reason?: string;
}

export interface PeriodOffResponse {
    id: number;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    reason?: string;
}

// Represents a time slot in the client's availability response
export interface Slot {
    startTime: string; // ISO time string
    endTime: string; // ISO time string
}

// Represents a day's availability in the client's response
interface DayAvailability {
    date: string;
    available: Slot[];
    occupied: Slot[];
}

// Response for workers
// Note: Only includes fields matching the 'include' filter from AvailabilityWorkerFilter
export interface AvailabilityWorkerResponse {
    workingHours?: WorkingHourResponse[];
    timeOffs?: {
        recurring: RecurringTimeOffResponse[];
        specific: SpecificTimeOffResponse[];
    };
    dayOffs?: DayOffResponse[];
    periodOffs?: PeriodOffResponse[];
}

// Response for clients
export type AvailabilityClientResponse = DayAvailability[];

// ============================================================
// * FILTERS
// ============================================================
// Filters for worker availability query
export interface AvailabilityWorkerFilters {
    workerId: number;
    include?: AvailabilityType[];
    view?: ViewType;
    date?: string; // ISO date string
    // For DAY the specified date is used
    // For WEEK the first day of the week containing the specified date is used
    // For MONTH the first day of the month containing the specified date is used
}

// Filters for client availability query
export interface AvailabilityClientFilters {
    workerId: number;
    view?: ViewType;
    date?: string; // ISO date string
}

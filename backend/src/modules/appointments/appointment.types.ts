import {
    Pagination,
    PaginationMeta,
} from '../../shared/types/pagination.types.js';

export enum Status {
    PENDING = 'PENDING',
    REJECTED = 'REJECTED',
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
    NO_SHOW = 'NO_SHOW',
}

export enum Role {
    WORKER = 'WORKER',
    CLIENT = 'CLIENT',
}

// ============================================================
// * ENTITIES
// ============================================================
export interface Appointment {
    id: number;
    workerId: number;
    clientId: number;
    startAt: Date;
    endAt: Date;
    status: Status;
    createdBy: Role;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface AppointmentService {
    id: number;
    appointmentId: number;
    serviceId: number;
    customDurationMin: number; // Duration in minutes, if null, use service's default duration
    customPrice: number; // if null, use service's default price
}

// ============================================================
// * PERSISTENCE MODELS
// ============================================================
export interface CreateAppointmentData {
    workerId: number;
    clientId: number;
    startAt: string; // ISO date string
    endAt: string; // ISO date string
    status: Status;
    createdBy: Role;
    notes?: string;
    services: {
        serviceId: number;
        customDurationMin: number;
        customPrice: number;
    }[];
}

// ============================================================
// * INPUTS
// ============================================================
export interface OverlapVerificationInput {
    workerId: number;
    startAt: string; // ISO date-time string
    services: {
        serviceId: number;
        customDurationMin: number;
    }[];
}

export interface VerifyOverlapInput {
    workerId: number;
    startAt: string;
    endAt: string;
    clientId?: number;
}

export interface CreateAppointmentInput {
    workerId: number;
    clientId: number;
    startAt: string; // ISO date string
    notes?: string;
    services: {
        serviceId: number;
        customDurationMin?: number;
        customPrice?: number;
    }[];
}

export interface UpdateAppointmentInput {
    id: number;
    startAt?: string; // ISO date string
    notes?: string;
    services?: {
        serviceId: number;
        customDurationMin?: number;
        customPrice?: number;
    }[];
}

export interface RescheduleAppointmentInput {
    id: number;
    startAt: string; // ISO date string
    services?: {
        serviceId: number;
    }[];
}

export interface RejectAppointmentInput {
    id: number;
    reason?: string;
}

export interface ChangeAppointmentStatusInput {
    id: number;
    status: Exclude<Status, 'PENDING' | 'REJECTED' | 'SCHEDULED'>;
}

// ============================================================
// * FILTERS
// ============================================================
export interface OverlapFilter {
    workerId?: number;
    clientId?: number;
    startAt: string;
    endAt: string;
}

export interface AppointmentFilters {
    workerId?: number;
    clientId?: number;
    status?: Status;
    from?: string; // ISO date string
    to?: string; // ISO date string
}

export interface AppointmentQuery extends AppointmentFilters, Pagination {}

// ============================================================
// * RESPONSES
// ============================================================
export interface OverlapVerificationResponse {
    allowed: boolean; // true if no overlap or overlap count < maxOverlapsAllowed
    needsConfirmation: boolean; // true if overlap detected but still within limit
    message: string;
}

export interface CreateAppointmentResponse {
    id: number;
    startAt: Date;
    endAt: Date;
    status: Status;
}

export interface AppointmentResponse {
    id: number;
    startAt: Date;
    endAt: Date;
    status: Status;
    createdBy: Role;
    notes: string | null;
    worker: {
        id: number;
        name: string;
    };
    client: {
        id: number;
        name: string;
    };
    services: {
        id: number;
        name: string;
        customDurationMin: number;
        customPrice: number;
    };
}

export interface PaginatedAppointmentResponse {
    data: AppointmentResponse[];
    meta: PaginationMeta;
}

export interface RescheduleAppointmentResponse {
    newAppointmentId: number;
    cancelledAppointmentId: number;
}

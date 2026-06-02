import {
    Pagination,
    PaginationMeta,
} from '../../shared/types/pagination.types.js';

export type ViewType = 'DAY' | 'WEEK' | 'MONTH';

export const Status = {
    PENDING: 'PENDING',
    REJECTED: 'REJECTED',
    SCHEDULED: 'SCHEDULED',
    IN_PROGRESS: 'IN_PROGRESS',
    CANCELLED: 'CANCELLED',
    COMPLETED: 'COMPLETED',
    NO_SHOW: 'NO_SHOW',
} as const;
export type Status = (typeof Status)[keyof typeof Status];

export const Role = {
    WORKER: 'WORKER',
    CLIENT: 'CLIENT',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

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

interface WorkerSummary {
    id: number;
    firstName: string;
    lastName: string;
}

interface ClientSummary {
    id: number;
    firstName: string;
    lastName: string;
}

interface ServiceSummary {
    id: number;
    name: string;
    colorHex: string;
    defaultDurationMin: number;
    defaultPrice: number;
}

interface AppointmentServiceSummary {
    id: number;
    service: ServiceSummary;
    customDurationMin: number;
    customPrice: number;
}

export interface BasicAppointment {
    id: number;
    startAt: Date;
    endAt: Date;
    status: Status;
    notes: string | null;
    worker: WorkerSummary;
    client: ClientSummary;
    services: { service: { id: number; name: string; colorHex: string } }[];
}

export interface ExtendedAppointment extends Appointment {
    worker: WorkerSummary;
    client: ClientSummary;
    services: AppointmentServiceSummary[];
}

// ============================================================
// * INPUTS
// ============================================================
export interface OverlapVerificationInput {
    workerId: number;
    startAt: string; // ISO date-time string
    services: {
        serviceId: number;
        customDuration: number;
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
        customDuration?: number;
        customPrice?: number;
    }[];
}

export interface UpdateAppointmentInput {
    id: number;
    startAt?: string; // ISO date string
    notes?: string;
    services?: {
        serviceId: number;
        customDuration?: number;
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
    status: Extract<Status, 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW'>;
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

export interface AppointmentFilter {
    workerId?: number;
    clientId?: number;
    status?: Status[];
    from?: string; // ISO date string
    to?: string; // ISO date string
}

export interface AppointmentHistoryFilter
    extends AppointmentFilter, Pagination {}

export interface ApppointmentCalendarFilter {
    view: ViewType;
    date: string; // ISO date string
    workerId?: number;
    clientId?: number;
}

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
    startAt: string;
    endAt: string;
    status: Status;
    worker: { id: number; name: string };
    client: { id: number; name: string };
    services: { id: number; name: string; color: string }[];
}

export interface ClientAppointmentResponse {
    id: number;
    startAt: string;
    endAt: string;
    status: Status;
    worker: { id: number; name: string };
    services: { id: number; name: string; color: string }[];
}

export interface WorkerAppointmentResponse {
    id: number;
    startAt: string;
    endAt: string;
    status: Status;
    notes: string | null;
    worker: { id: number; name: string };
    client: { id: number; name: string };
    services: { id: number; name: string; color: string }[];
}

export type AppointmentCalendarResponse =
    | ClientAppointmentResponse[]
    | WorkerAppointmentResponse[];

export interface ExtendedAppointmentResponse {
    id: number;
    startAt: string;
    endAt: string;
    status: Status;
    createdBy: Role;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    worker: { id: number; name: string };
    client: { id: number; name: string };
    services: {
        id: number;
        customDuration: number;
        customPrice: number;
        service: {
            id: number;
            name: string;
            color: string;
            defaultDuration: number;
            defaultPrice: number;
        };
    }[];
}

export interface PaginatedAppointmentResponse {
    data: AppointmentResponse[];
    meta: PaginationMeta;
}

export interface RescheduleAppointmentResponse {
    newAppointmentId: number;
    cancelledAppointmentId: number;
}

export interface INotificationChannel {
    send(payload: NotificationPayload): Promise<void>;
}

export type NotificationPayload = {
    [E in keyof NotificationDataMap]: {
        recipient: Recipient;
        event: E;
        data: NotificationDataMap[E];
    };
}[keyof NotificationDataMap];

export interface Recipient {
    name?: string;
    email?: string;
    phone?: string;
}

export enum NotificationEvent {
    APPOINTMENT_APPROVED = 'appointment.approved',
    APPOINTMENT_REJECTED = 'appointment.rejected',
    APPOINTMENT_CANCELLED = 'appointment.cancelled',
    APPOINTMENT_REQUESTED = 'appointment.requested',
    APPOINTMENT_SCHEDULED = 'appointment.scheduled',
    PASSWORD_RESET = 'password.reset',
}

export interface NotificationDataMap {
    [NotificationEvent.APPOINTMENT_APPROVED]: AppointmentApprovedData;
    [NotificationEvent.APPOINTMENT_CANCELLED]: AppointmentCancelledData;
    [NotificationEvent.APPOINTMENT_REJECTED]: AppointmentRejectedData;
    [NotificationEvent.APPOINTMENT_REQUESTED]: AppointmentRequestedData;
    [NotificationEvent.APPOINTMENT_SCHEDULED]: AppointmentScheduledData;
    [NotificationEvent.PASSWORD_RESET]: PasswordResetData;
}

interface AppointmentTime {
    date: string;
    time: string;
}

export interface AppointmentApprovedData extends AppointmentTime {
    workerName: string;
    clientName: string;
    services: Service[];
    notes?: string;
}

export interface AppointmentCancelledData extends AppointmentTime {
    isClient: boolean;
    cancelledByName: string;
    cancelledToName: string;
    reason?: string;
    phone?: string;
}

export interface AppointmentRejectedData extends AppointmentTime {
    workerName: string;
    clientName: string;
}

export interface AppointmentRequestedData extends AppointmentTime {
    workerName: string;
    clientName: string;
    services: Service[];
}

export interface AppointmentScheduledData extends AppointmentTime {
    workerName: string;
    clientName: string;
    services: Service[];
    notes?: string;
}

export interface PasswordResetData {
    otp: string;
    expiresIn: number;
}

export interface Service {
    name: string;
    color: string;
}

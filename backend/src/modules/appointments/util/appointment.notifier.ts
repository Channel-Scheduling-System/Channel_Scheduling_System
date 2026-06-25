import { INotificationService } from '../../notifications/notification.service.js';
import { NotifyAppointmentResponse, Role } from '../appointment.types.js';
import {
    NotificationEvent,
    NotificationPayload,
} from '../../notifications/notification.types.js';

export class AppointmentNotifier {
    constructor(private readonly notificationService: INotificationService) {}

    async sendApprovedNotification(
        apm: NotifyAppointmentResponse,
        notes?: string,
    ) {
        const payload: NotificationPayload = {
            recipient: {
                name: apm.client.name,
                email: apm.client.email,
            },
            event: NotificationEvent.APPOINTMENT_APPROVED,
            data: {
                date: apm.date,
                time: apm.time,
                workerName: apm.worker.name,
                clientName: apm.client.name,
                services: apm.services,
                notes,
            },
        };
        await this.notificationService.notify([payload]);
    }

    async sendCancelledNotification(
        apm: NotifyAppointmentResponse,
        submittedBy: Role,
        reason?: string,
    ) {
        const isClient = submittedBy === Role.CLIENT;
        const payload: NotificationPayload = {
            recipient: {
                name: isClient ? apm.worker.name : apm.client.name,
                email: isClient ? apm.worker.email : apm.client.email,
            },
            event: NotificationEvent.APPOINTMENT_CANCELLED,
            data: {
                date: apm.date,
                time: apm.time,
                isClient,
                cancelledByName: isClient ? apm.client.name : apm.worker.name,
                cancelledToName: isClient ? apm.worker.name : apm.client.name,
                reason,
                phone:
                    (isClient ? apm.client.phone : apm.worker.phone) ||
                    undefined,
            },
        };
        await this.notificationService.notify([payload]);
    }

    async sendRejectedNotification(apm: NotifyAppointmentResponse) {
        const payload: NotificationPayload = {
            recipient: {
                name: apm.client.name,
                email: apm.client.email,
            },
            event: NotificationEvent.APPOINTMENT_REJECTED,
            data: {
                date: apm.date,
                time: apm.time,
                workerName: apm.worker.name,
                clientName: apm.client.name,
            },
        };
        await this.notificationService.notify([payload]);
    }

    async sendRequestedNotification(apm: NotifyAppointmentResponse) {
        const payload: NotificationPayload = {
            recipient: {
                name: apm.worker.name,
                email: apm.worker.email,
            },
            event: NotificationEvent.APPOINTMENT_REQUESTED,
            data: {
                date: apm.date,
                time: apm.time,
                workerName: apm.worker.name,
                clientName: apm.client.name,
                services: apm.services,
            },
        };
        await this.notificationService.notify([payload]);
    }

    async sendScheduledNotification(
        apm: NotifyAppointmentResponse,
        notes?: string,
    ) {
        const payload: NotificationPayload = {
            recipient: {
                name: apm.client.name,
                email: apm.client.email,
            },
            event: NotificationEvent.APPOINTMENT_SCHEDULED,
            data: {
                date: apm.date,
                time: apm.time,
                workerName: apm.worker.name,
                clientName: apm.client.name,
                services: apm.services,
                notes,
            },
        };
        await this.notificationService.notify([payload]);
    }
}

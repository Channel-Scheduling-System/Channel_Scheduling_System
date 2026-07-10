import { INotificationService } from '../../notifications/notification.service.js';
import { NotifyAppointmentResponse, Role } from '../appointment.types.js';
import {
    NotificationChannelName,
    NotificationEvent,
    NotificationPayload,
} from '../../notifications/notification.types.js';

const NOTIFICATION_CHANNELS = {
    channels: [NotificationChannelName.WHATSAPP],
    fallbackChannels: [NotificationChannelName.EMAIL],
};

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
                phone: apm.client.phone || undefined,
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
        await this.notificationService.notify([payload], NOTIFICATION_CHANNELS);
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
                phone:
                    (isClient ? apm.worker.phone : apm.client.phone) ||
                    undefined,
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
                    (isClient ? apm.worker.phone : apm.client.phone) ||
                    undefined,
            },
        };
        await this.notificationService.notify([payload], NOTIFICATION_CHANNELS);
    }

    async sendRejectedNotification(apm: NotifyAppointmentResponse) {
        const payload: NotificationPayload = {
            recipient: {
                name: apm.client.name,
                email: apm.client.email,
                phone: apm.client.phone || undefined,
            },
            event: NotificationEvent.APPOINTMENT_REJECTED,
            data: {
                date: apm.date,
                time: apm.time,
                workerName: apm.worker.name,
                clientName: apm.client.name,
            },
        };
        await this.notificationService.notify([payload], NOTIFICATION_CHANNELS);
    }

    async sendRequestedNotification(apm: NotifyAppointmentResponse) {
        const payload: NotificationPayload = {
            recipient: {
                name: apm.worker.name,
                email: apm.worker.email,
                phone: apm.worker.phone || undefined,
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
        await this.notificationService.notify([payload], NOTIFICATION_CHANNELS);
    }

    async sendScheduledNotification(
        apm: NotifyAppointmentResponse,
        notes?: string,
    ) {
        const payload: NotificationPayload = {
            recipient: {
                name: apm.client.name,
                email: apm.client.email,
                phone: apm.client.phone || undefined,
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
        await this.notificationService.notify([payload], NOTIFICATION_CHANNELS);
    }
}

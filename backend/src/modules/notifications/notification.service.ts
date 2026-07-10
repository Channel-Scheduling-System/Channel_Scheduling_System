import {
    NotificationChannelNotFoundError,
    NotificationDeliveryFailedError,
} from './errors/notification.error.js';
import {
    INotificationChannel,
    NotificationChannelName,
    NotificationEvent,
    NotificationPayload,
    NotifyOptions,
} from './notification.types.js';

export interface INotificationService {
    notify(
        notifications: NotificationPayload[],
        options?: NotifyOptions,
    ): Promise<void>;
}

const DEFAULT_CHANNELS = {
    [NotificationEvent.PASSWORD_RESET]: [NotificationChannelName.EMAIL],
    [NotificationEvent.APPOINTMENT_APPROVED]: [
        NotificationChannelName.WHATSAPP,
    ],
    [NotificationEvent.APPOINTMENT_REJECTED]: [
        NotificationChannelName.WHATSAPP,
    ],
    [NotificationEvent.APPOINTMENT_CANCELLED]: [
        NotificationChannelName.WHATSAPP,
    ],
    [NotificationEvent.APPOINTMENT_REQUESTED]: [
        NotificationChannelName.WHATSAPP,
    ],
    [NotificationEvent.APPOINTMENT_SCHEDULED]: [
        NotificationChannelName.WHATSAPP,
    ],
} satisfies Partial<Record<NotificationEvent, NotificationChannelName[]>>;

export class NotificationService implements INotificationService {
    private readonly channelsMap: Map<
        NotificationChannelName,
        INotificationChannel
    >;

    constructor(channels: INotificationChannel[]) {
        this.channelsMap = new Map(
            channels.map((channel) => [channel.name, channel]),
        );
    }

    async notify(
        notifications: NotificationPayload[],
        options?: NotifyOptions,
    ): Promise<void> {
        try {
            for (const notification of notifications) {
                await this.sendNotification(notification, options);
            }
        } catch (error) {
            console.error('Error sending notifications:', error);
            throw error;
        }
    }

    private async sendNotification(
        notification: NotificationPayload,
        options?: NotifyOptions,
    ): Promise<void> {
        const channels = this.resolveChannels(notification.event, options);
        let lastError: unknown;

        for (const channelName of channels) {
            const channel = this.channelsMap.get(channelName);
            if (!channel)
                throw new NotificationChannelNotFoundError(channelName);

            try {
                await channel.send(notification);
                return;
            } catch (error) {
                lastError = error;
            }
        }

        if (lastError)
            throw new NotificationDeliveryFailedError(notification.event);
    }

    private resolveChannels(
        event: NotificationEvent,
        options?: NotifyOptions,
    ): NotificationChannelName[] {
        return [
            ...new Set([
                ...(options?.channels ?? this.getDefaultChannels(event)),
                ...(options?.fallbackChannels ?? []),
            ]),
        ];
    }

    private getDefaultChannels(
        event: NotificationEvent,
    ): NotificationChannelName[] {
        return DEFAULT_CHANNELS[event] ?? [NotificationChannelName.EMAIL];
    }
}

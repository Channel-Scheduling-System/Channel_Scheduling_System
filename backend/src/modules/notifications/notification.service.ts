import {
    INotificationChannel,
    NotificationPayload,
} from './notification.types.js';

export interface INotificationService {
    notify(notifications: NotificationPayload[]): Promise<void>;
}

export class NotificationService implements INotificationService {
    constructor(private readonly channels: INotificationChannel[]) {}

    async notify(notifications: NotificationPayload[]): Promise<void> {
        console.log(this.channels)
        await Promise.allSettled(
            notifications.flatMap((notification) =>
                this.channels.map((channel) => channel.send(notification)),
            ),
        );
    }
}

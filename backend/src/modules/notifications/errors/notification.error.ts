import { DomainError } from '../../../shared/errors/domain.error.js';
import {
    NotificationChannelName,
    NotificationEvent,
} from '../notification.types.js';

export class NotificationError extends DomainError {
    constructor(message: string, code: string) {
        super(message, 503, code);
    }
}

export class NotificationChannelNotFoundError extends NotificationError {
    constructor(channel: NotificationChannelName) {
        super(
            `Notification channel "${channel}" is not registered.`,
            'NOTIFICATION_CHANNEL_NOT_FOUND',
        );
    }
}

export class NotificationDeliveryFailedError extends NotificationError {
    constructor(event: NotificationEvent) {
        super(
            `Failed to deliver notification for event "${event}".`,
            'NOTIFICATION_DELIVERY_FAILED',
        );
    }
}

export class NoNotificationChannelsError extends NotificationError {
    constructor(event: NotificationEvent) {
        super(
            `No notification channels configured for event "${event}".`,
            'NO_NOTIFICATION_CHANNELS',
        );
    }
}

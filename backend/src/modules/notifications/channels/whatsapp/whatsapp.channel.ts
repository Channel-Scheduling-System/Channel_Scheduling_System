import { env } from '../../../../config/env.js';
import { ServiceError } from '../../../../shared/errors/domain.error.js';
import {
    INotificationChannel,
    NotificationPayload,
} from '../../notification.types.js';
import { resolveWhatsAppTemplate } from './templates/index.js';

const BASE_URL = `https://graph.facebook.com/${env.whatsapp.apiVersion}`;

export class WhatsAppChannel implements INotificationChannel {
    async send(payload: NotificationPayload): Promise<void> {
        if (!payload.recipient.phone) return;

        const body = resolveWhatsAppTemplate(payload);
        console.log(body);
        const response = await fetch(
            `${BASE_URL}/${env.whatsapp.phoneNumberId}/messages`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${env.whatsapp.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: `57${payload.recipient.phone}`,
                    type: 'template',
                    template: body,
                }),
            },
        );

        if (!response.ok) {
            const error = await response.json();
            throw new ServiceError(`WhatsApp failed: ${JSON.stringify(error)}`);
        }
    }
}

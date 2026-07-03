import { MetaWebhookPayload } from './meta-webhook.types.js';
import { WhatsappWebhookEvent } from './webhook.types.js';

export function parseMetaWebhook(
    payload: MetaWebhookPayload,
): WhatsappWebhookEvent[] {
    const events: WhatsappWebhookEvent[] = [];

    for (const entry of payload.entry) {
        for (const change of entry.changes) {
            const { messages, statuses } = change.value;

            if (statuses)
                for (const status of statuses) {
                    events.push({
                        type: 'message_status',
                        messageId: status.id,
                        recipientId: status.recipient_id,
                        status: status.status,
                        timestamp: new Date(Number(status.timestamp) * 1000),
                    });
                }

            if (messages)
                for (const message of messages) {
                    events.push({
                        type: 'incoming_message',
                        messageId: message.id,
                        from: message.from,
                        text: message.text?.body ?? '',
                        timestamp: new Date(Number(message.timestamp) * 1000),
                    });
                }
        }
    }

    return events;
}

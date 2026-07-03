import { env } from '../../../../../config/env.js';
import { parseMetaWebhook } from './meta-webhook.parser.js';
import { MetaWebhookPayload } from './meta-webhook.types.js';
import {
    IncomingMessageEvent,
    MessageStatusEvent,
    WebhookVerification,
} from './webhook.types.js';

export interface IWhatsappWebhookService {
    verify(input: WebhookVerification): boolean;
    handle(payload: MetaWebhookPayload): Promise<void>;
}

export class WhatsappWebhookService implements IWhatsappWebhookService {
    verify(input: WebhookVerification): boolean {
        return (
            input.mode === 'subscribe' &&
            input.token === env.whatsapp.verifyToken
        );
    }

    async handle(payload: MetaWebhookPayload): Promise<void> {
        const events = parseMetaWebhook(payload);
        for (const event of events) {
            switch (event.type) {
                case 'message_status':
                    await this.handleMessageStatus(event);
                    break;

                case 'incoming_message':
                    await this.handleIncomingMessage(event);
                    break;
            }
        }
    }

    private async handleMessageStatus(event: MessageStatusEvent) {
        console.log('Message status event received:', event);
    }

    private async handleIncomingMessage(event: IncomingMessageEvent) {
        console.log('Incoming message event received:', event);
    }
}

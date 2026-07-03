import { env } from '../../config/env.js';
import { EmailChannel } from './channels/email/email.channel.js';
import { WhatsappWebhookController } from './channels/whatsapp/webhook/webhook.controller.js';
import { WhatsappWebhookService } from './channels/whatsapp/webhook/webhook.service.js';
import { WhatsAppChannel } from './channels/whatsapp/whatsapp.channel.js';
import { NotificationService } from './notification.service.js';
import { INotificationChannel } from './notification.types.js';

const whatsappWebhookService = new WhatsappWebhookService();
export const whatsappWebhookController = new WhatsappWebhookController(
    whatsappWebhookService,
);

const emailChannel = new EmailChannel();
const whatsappChannel = new WhatsAppChannel();

const channels: INotificationChannel[] = [emailChannel];
if (env.whatsapp.enabled) channels.push(whatsappChannel);

export const notificationService = new NotificationService(channels);

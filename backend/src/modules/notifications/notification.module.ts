import { EmailChannel } from './channels/email/email.channel.js';
import { WhatsAppChannel } from './channels/whatsapp/whatsapp.channel.js';
import { NotificationService } from './notification.service.js';

const emailChannel = new EmailChannel();
const whatsappChannel = new WhatsAppChannel();

export const notificationService = new NotificationService([
    emailChannel,
    whatsappChannel,
]);

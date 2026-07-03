import { Router } from 'express';
import { whatsappWebhookController } from '../../../notification.module.js';

const whatsappWebhookRouter = Router();

whatsappWebhookRouter.get(
    '/webhooks/whatsapp',
    whatsappWebhookController.verify,
);

whatsappWebhookRouter.post(
    '/webhooks/whatsapp',
    whatsappWebhookController.handle,
);

export default whatsappWebhookRouter;

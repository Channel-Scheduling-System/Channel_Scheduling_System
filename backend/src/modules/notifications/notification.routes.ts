import { Router } from 'express';
import whatsappWebhookRouter from './channels/whatsapp/webhook/webhook.routes.js';

const notificationRouter = Router();

notificationRouter.use(whatsappWebhookRouter);

export default notificationRouter;

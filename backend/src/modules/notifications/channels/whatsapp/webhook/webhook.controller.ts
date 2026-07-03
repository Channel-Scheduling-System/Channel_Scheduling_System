import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IWhatsappWebhookService } from './webhook.service.js';

export class WhatsappWebhookController {
    constructor(private readonly webhookService: IWhatsappWebhookService) {}

    verify = (req: Request, res: Response, next: NextFunction) => {
        try {
            const mode = req.query['hub.mode'] as string | undefined;
            const token = req.query['hub.verify_token'] as string | undefined;
            const challenge = req.query['hub.challenge'] as string | undefined;

            if (this.webhookService.verify({ mode, token }))
                return res.status(StatusCodes.OK).send(challenge);

            return res.sendStatus(StatusCodes.FORBIDDEN);
        } catch (error) {
            next(error);
        }
    };

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.webhookService.handle(req.body);
            return res.sendStatus(StatusCodes.OK);
        } catch (error) {
            next(error);
        }
    };
}

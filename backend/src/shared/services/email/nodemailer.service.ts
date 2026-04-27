import nodemailer from 'nodemailer';
import { env } from '../../../config/env.js';
import { ServiceError } from '../../errors/domain.error.js';
import { EmailOptions, IEmailService } from './email.types.js';

export class NodemailerEmailService implements IEmailService {
    private transporter = nodemailer.createTransport({
        host: env.email.host,
        port: env.email.port,
        secure: env.email.port === 465,
        auth: {
            user: env.email.user,
            pass: env.email.pass,
        },
    });

    async send(options: EmailOptions): Promise<void> {
        try {
            await this.transporter.sendMail({
                to: options.to,
                subject: options.subject,
                html: options.html,
            });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Unknown error';
            throw new ServiceError(`Fallo al enviar email: ${message}`);
        }
    }

    async verify(): Promise<boolean> {
        try {
            await this.transporter.verify();
            return true;
        } catch {
            return false;
        }
    }
}

export const emailService = new NodemailerEmailService();

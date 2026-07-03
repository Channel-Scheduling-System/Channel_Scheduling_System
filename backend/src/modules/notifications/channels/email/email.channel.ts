import nodemailer from 'nodemailer';
import { env } from '../../../../config/env.js';
import { ServiceError } from '../../../../shared/errors/domain.error.js';
import {
    INotificationChannel,
    NotificationPayload,
} from '../../notification.types.js';
import { resolveEmailTemplate } from './templates/index.js';

const transporter = nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.port === 465,
    auth: {
        user: env.email.user,
        pass: env.email.pass,
    },
    requireTLS: env.nodeEnv === 'production',
    tls: {
        rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
});

export class EmailChannel implements INotificationChannel {
    private readonly transporter = transporter;

    async send(payload: NotificationPayload): Promise<void> {
        if (!payload.recipient.email) return;
        const { subject, html } = resolveEmailTemplate(payload);
        
        try {
            await this.transporter.sendMail({
                from: env.email.from,
                to: payload.recipient.email,
                subject,
                html,
            });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Unknown error';
            throw new ServiceError(`Email failed: ${message}`);
        }
    }

    async verify(): Promise<boolean> {
        try {
            await transporter.verify();
            return true;
        } catch {
            return false;
        }
    }
}

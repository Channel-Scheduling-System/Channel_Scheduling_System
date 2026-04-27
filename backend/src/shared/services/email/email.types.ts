export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export interface IEmailService {
    send(options: EmailOptions): Promise<void>;
}

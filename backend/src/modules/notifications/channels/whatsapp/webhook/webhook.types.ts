export interface WebhookVerification {
    mode: string | undefined;
    token: string | undefined;
}

export type WhatsappWebhookEvent =
    | MessageStatusEvent
    | IncomingMessageEvent;

export interface MessageStatusEvent {
    type: 'message_status';
    messageId: string;
    recipientId: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: Date;
}

export interface IncomingMessageEvent {
    type: 'incoming_message';
    messageId: string;
    from: string;
    text: string;
    timestamp: Date;
}

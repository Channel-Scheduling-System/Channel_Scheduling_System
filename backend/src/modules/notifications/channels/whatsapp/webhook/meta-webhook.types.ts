export interface MetaWebhookPayload {
    object: 'whatsapp_business_account';
    entry: MetaEntry[];
}

interface MetaEntry {
    changes: MetaChange[];
}

interface MetaChange {
    value: MetaValue;
}

interface MetaValue {
    messages?: MetaMessage[];
    statuses?: MetaStatus[];
}

interface MetaMessage {
    id: string;
    from: string;
    timestamp: string;
    text?: {
        body: string;
    };
}

interface MetaStatus {
    id: string;
    recipient_id: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: string;
}
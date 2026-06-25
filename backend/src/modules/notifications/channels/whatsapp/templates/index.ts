import {
    NotificationEvent,
    NotificationPayload,
} from '../../../notification.types.js';

import { appointmentApprovedTemplate } from './appointment-approved.template.js';
import { appointmentCancelledTemplate } from './appointment-cancelled.template.js';
import { appointmentRejectedTemplate } from './appointment-rejected.template.js';
import { appointmentRequestedTemplate } from './appointment-requested.template.js';
import { appointmentScheduledTemplate } from './appointment-scheduled.template.js';

export function resolveWhatsAppTemplate(payload: NotificationPayload): object {
    const { event, data } = payload;
    switch (event) {
        case NotificationEvent.APPOINTMENT_APPROVED:
            return appointmentApprovedTemplate(data);
        case NotificationEvent.APPOINTMENT_CANCELLED:
            return appointmentCancelledTemplate(data);
        case NotificationEvent.APPOINTMENT_REJECTED:
            return appointmentRejectedTemplate(data);
        case NotificationEvent.APPOINTMENT_REQUESTED:
            return appointmentRequestedTemplate(data);
        case NotificationEvent.APPOINTMENT_SCHEDULED:
            return appointmentScheduledTemplate(data);
        default:
            throw new Error(`No WhatsApp template for event: ${event}`);
    }
}

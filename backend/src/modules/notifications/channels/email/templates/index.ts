import {
    NotificationPayload,
    NotificationEvent,
} from '../../../notification.types.js';
import { appointmentApprovedHTML } from './appointment-approved.template.js';
import { appointmentCancelledHTML } from './appointment-cancelled.template.js';
import { appointmentRejectedHTML } from './appointment-rejected.template.js';
import { appointmentRequestedHTML } from './appointment-requested.template.js';
import { appointmentScheduledHTML } from './appointment-scheduled.template.js';
import { passwordResetHTML } from './password-reset.template.js';
import { assertNever } from '../../../../../shared/types/never.js';

const BUSSINESS_NAME = 'Channel Peluquería';
const APM_APPROVE = '¡Tu cita ha sido confirmada!';
const APM_CANCEL = 'Cita cancelada';
const APM_REJECT = 'Solicitud de cita rechazada';
const APM_REQUEST = '¡Nueva solicitud de cita!';
const APM_SCHEDULE = '¡Nueva cita programada!';
const PASS_RESET = 'Restablece tu contraseña';

export function resolveEmailTemplate(payload: NotificationPayload): {
    subject: string;
    html: string;
} {
    const { data, event } = payload;
    switch (event) {
        case NotificationEvent.APPOINTMENT_APPROVED:
            return {
                subject: APM_APPROVE + ' ' + BUSSINESS_NAME,
                html: appointmentApprovedHTML(data),
            };
        case NotificationEvent.APPOINTMENT_CANCELLED:
            return {
                subject: APM_CANCEL + ' ' + BUSSINESS_NAME,
                html: appointmentCancelledHTML(data),
            };
        case NotificationEvent.APPOINTMENT_REJECTED:
            return {
                subject: APM_REJECT + ' ' + BUSSINESS_NAME,
                html: appointmentRejectedHTML(data),
            };
        case NotificationEvent.APPOINTMENT_REQUESTED:
            return {
                subject: APM_REQUEST + ' ' + BUSSINESS_NAME,
                html: appointmentRequestedHTML(data),
            };
        case NotificationEvent.APPOINTMENT_SCHEDULED:
            return {
                subject: APM_SCHEDULE + ' ' + BUSSINESS_NAME,
                html: appointmentScheduledHTML(data),
            };
        case NotificationEvent.PASSWORD_RESET:
            return {
                subject: PASS_RESET + ' ' + BUSSINESS_NAME,
                html: passwordResetHTML(data),
            };
        default:
            return assertNever(payload);
    }
}

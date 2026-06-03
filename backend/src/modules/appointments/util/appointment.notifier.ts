import { emailService } from '../../../shared/services/email/index.js';
import { generateAppointmentApprovedEmailHTML } from '../../../shared/services/email/templates/appointment-approved.template.js';
import { generateAppointmentRejectedEmailHTML } from '../../../shared/services/email/templates/appointment-rejected.template.js';
import { generateAppointmentCancelledEmailHTML } from '../../../shared/services/email/templates/appointment-cancelled.template.js';
import { NotifyAppointmentResponse, Role } from '../appointment.types.js';
import { generateAppointmentScheduledHTML } from '#/shared/services/email/templates/appointment-scheduled.template.js';
import { generateAppointmentRequestedHTML } from '#/shared/services/email/templates/appointment-requested.template.js';

const SCHEDULE_SUBJECT = '¡Nueva cita programada! - Channel Scheduling System';
const REQUEST_SUBJECT = '¡Nueva solicitud de cita! - Channel Scheduling System';
const APPROVE_SUBJECT =
    '¡Tu cita ha sido confirmada! - Channel Scheduling System';
const REJECT_SUBJECT =
    'Solicitud de cita rechazada - Channel Scheduling System';
const CANCEL_SUBJECT = 'Cita cancelada - Channel Scheduling System';

export class AppointmentNotifier {
    async sendScheduledNotification(
        appointment: NotifyAppointmentResponse,
        notes?: string,
    ) {
        const html = generateAppointmentScheduledHTML({
            clientName: appointment.client.name,
            workerName: appointment.worker.name,
            dateStr: appointment.dateStr,
            timeStr: appointment.timeStr,
            services: appointment.services,
            notes: notes,
        });
        await emailService.send({
            to: appointment.client.email,
            subject: SCHEDULE_SUBJECT,
            html,
        });
    }

    async sendRequestedNotification(appointment: NotifyAppointmentResponse) {
        const html = generateAppointmentRequestedHTML({
            clientName: appointment.client.name,
            workerName: appointment.worker.name,
            dateStr: appointment.dateStr,
            timeStr: appointment.timeStr,
            services: appointment.services,
        });
        await emailService.send({
            to: appointment.worker.email,
            subject: REQUEST_SUBJECT,
            html,
        });
    }

    async sendApprovedNotification(
        appointment: NotifyAppointmentResponse,
        notes?: string,
    ) {
        const html = generateAppointmentApprovedEmailHTML({
            clientName: appointment.client.name,
            workerName: appointment.worker.name,
            dateStr: appointment.dateStr,
            timeStr: appointment.timeStr,
            notes: notes,
        });
        await emailService.send({
            to: appointment.client.email,
            subject: APPROVE_SUBJECT,
            html,
        });
    }

    async sendRejectedNotification(appointment: NotifyAppointmentResponse) {
        const html = generateAppointmentRejectedEmailHTML({
            clientName: appointment.client.name,
            workerName: appointment.worker.name,
            dateStr: appointment.dateStr,
            timeStr: appointment.timeStr,
        });
        await emailService.send({
            to: appointment.client.email,
            subject: REJECT_SUBJECT,
            html,
        });
    }

    async sendCancelledNotification(
        appointment: NotifyAppointmentResponse,
        submittedBy: Role,
        reason?: string,
    ) {
        const html = generateAppointmentCancelledEmailHTML({
            recipientName:
                submittedBy === Role.CLIENT
                    ? appointment.worker.name
                    : appointment.client.name,
            cancelledByName:
                submittedBy === Role.CLIENT
                    ? appointment.client.name
                    : appointment.worker.name,
            dateStr: appointment.dateStr,
            timeStr: appointment.timeStr,
            reason,
        });
        await emailService.send({
            to:
                submittedBy === Role.CLIENT
                    ? appointment.worker.email
                    : appointment.client.email,
            subject: CANCEL_SUBJECT,
            html,
        });
    }
}

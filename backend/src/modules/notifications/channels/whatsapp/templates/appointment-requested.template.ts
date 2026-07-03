import { AppointmentRequestedData } from '../../../notification.types.js';

export function appointmentRequestedTemplate(
    data: AppointmentRequestedData,
): object {
    return {
        name: 'appointment_requested',
        language: { code: 'es' },
        components: [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: data.workerName },
                    { type: 'text', text: data.clientName },
                    { type: 'text', text: data.date },
                    { type: 'text', text: data.time },
                    { type: 'text', text: data.services },
                ],
            },
        ],
    };
}

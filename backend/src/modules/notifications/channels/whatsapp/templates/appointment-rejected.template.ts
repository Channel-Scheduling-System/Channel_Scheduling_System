import { AppointmentRejectedData } from '../../../notification.types.js';

export function appointmentRejectedTemplate(
    data: AppointmentRejectedData,
): object {
    return {
        name: 'appointment_rejected',
        language: { code: 'es' },
        components: [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: data.clientName },
                    { type: 'text', text: data.workerName },
                    { type: 'text', text: data.date },
                    { type: 'text', text: data.time },
                ],
            },
        ],
    };
}

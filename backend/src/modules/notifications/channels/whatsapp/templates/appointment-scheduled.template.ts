import { AppointmentScheduledData } from '../../../notification.types.js';

export function appointmentScheduledTemplate(
    data: AppointmentScheduledData,
): object {
    return {
        name: 'appointment_scheduled',
        language: { code: 'es' },
        components: [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: data.clientName },
                    { type: 'text', text: data.workerName },
                    { type: 'text', text: data.date },
                    { type: 'text', text: data.time },
                    { type: 'text', text: data.services },
                    {
                        type: 'text',
                        text: data.notes ?? 'Sin notas',
                    },
                ],
            },
        ],
    };
}

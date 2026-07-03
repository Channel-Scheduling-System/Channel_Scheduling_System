import { AppointmentCancelledData } from '../../../notification.types.js';

export function appointmentCancelledTemplate(
    data: AppointmentCancelledData,
): object {
    return {
        name: data.isClient
            ? 'appointment_cancelled_client'
            : 'appointment_cancelled_worker',
        language: { code: 'es' },
        components: [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: data.cancelledToName },
                    { type: 'text', text: data.cancelledByName },
                    { type: 'text', text: data.date },
                    { type: 'text', text: data.time },
                    {
                        type: 'text',
                        text: data.reason ?? 'Sin motivo especificado',
                    },
                    { type: 'text', text: data.phone },
                ],
            },
        ],
    };
}

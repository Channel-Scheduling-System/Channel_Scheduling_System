import { AppointmentRequestedData } from '../../../notification.types.js';

export function appointmentRequestedHTML(
    data: AppointmentRequestedData,
): string {
    const calendarBlocksRendered =
        data.services
            ?.map(
                (service) => `
        <div class="calendar-item" style="border-left: 5px solid ${service.color}; background-color: ${service.color}12;">
            <span class="calendar-item__color-dot" style="background-color: ${service.color}; box-shadow: 0 0 10px ${service.color};"></span>
            <p class="calendar-item__name" style="color: #1c1b1b;">${service.name}</p>
        </div>
    `,
            )
            .join('') ?? '';

    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nueva Solicitud de Cita - Channel</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body {
                    font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background-color: #f5f0f0;
                    color: #1c1b1b;
                    line-height: 1.6;
                    -webkit-font-smoothing: antialiased;
                }
                .wrapper {
                    max-width: 600px;
                    margin: 2rem auto;
                    border-radius: 1.25rem;
                    overflow: hidden;
                    box-shadow: 0 32px 80px rgba(42, 0, 2, 0.22), 0 0 0 1px rgba(42, 0, 2, 0.06);
                }
                .header {
                    background: linear-gradient(135deg, #4a0010 0%, #2c2c2c 100%);
                    padding: 2.2rem 2rem 2rem;
                    text-align: center;
                }
                .header__badge {
                    display: inline-block;
                    background: rgba(255, 255, 255, 0.12);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    padding: 0.35rem 1rem;
                    border-radius: 2rem;
                    font-size: 0.65rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    color: #ffffff;
                    margin-bottom: 1rem;
                }
                .header__title {
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: #ffffff;
                    letter-spacing: -0.02em;
                }
                .content {
                    background: #ffffff;
                    padding: 2.5rem 2.5rem 2rem;
                }
                .content__greeting {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #1c1b1b;
                    margin-bottom: 0.5rem;
                }
                .agenda-container {
                    background: #fbf9f9;
                    border: 1px solid #eee9e8;
                    border-radius: 1rem;
                    padding: 1.5rem;
                    margin: 1.75rem 0;
                }
                .agenda-meta {
                    margin-bottom: 1.25rem;
                    padding-bottom: 1.25rem;
                    border-bottom: 1px dashed #e4dedd;
                }
                .agenda-meta__title {
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #877270;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .agenda-meta__value {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #4a0010;
                    margin-top: 0.5rem;
                }
                .calendar-item {
                    padding: 1rem;
                    border-radius: 0.5rem;
                    margin-bottom: 0.75rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .calendar-item__name {
                    font-size: 0.9rem;
                    font-weight: 700;
                }
                .calendar-item__color-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    display: inline-block;
                    margin-right: 0.75rem;
                    margin-top: 4px;
                    flex-shrink: 0;
                }
                .notes-box {
                    background: #fffcf7;
                    border-left: 3px solid #e0a96d;
                    padding: 0.85rem 1rem;
                    font-size: 0.85rem;
                    color: #6b5555;
                    border-radius: 0 0.5rem 0.5rem 0;
                    margin-top: 1rem;
                }
                .action-banner {
                    background: #f4f7f4;
                    border: 1px solid #dceedc;
                    border-radius: 0.75rem;
                    padding: 1rem;
                    text-align: center;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #2e7d32;
                    margin-top: 1.5rem;
                }
                .footer {
                    background: #2c2c2c;
                    padding: 1.25rem 2rem;
                    text-align: center;
                }
                .footer__text {
                    font-size: 0.72rem;
                    color: rgba(255, 255, 255, 0.4);
                }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="header">
                    <span class="header__badge">Acción Requerida</span>
                    <h1 class="header__title">Nueva Solicitud de Cita</h1>
                </div>
                <div class="content">
                    <p class="content__greeting">Hola ${data.workerName},</p>
                    <p style="font-size: 0.9rem; color: #5c4444;">
                        El cliente <strong>${data.clientName}</strong> ha solicitado reservar un espacio en tu agenda a través de la aplicación. Por favor, revisa la propuesta de horario:
                    </p>

                    <div class="agenda-container">
                        <div class="agenda-meta">
                            <p class="agenda-meta__title">Fecha y Horario Propuesto</p>
                            <p class="agenda-meta__value">📅 ${data.date}</p>
                            <p style="font-size: 0.9rem; font-weight: 700; color: #1c1b1b; margin-top: 0.2rem;">⏱ Horas: ${data.time}</p>
                        </div>

                        <p class="agenda-meta__title" style="margin-bottom: 0.75rem;">Servicios requeridos</p>
                        
                        ${calendarBlocksRendered}
                    </div>

                    <div class="action-banner">
                        ⚡ Ingresa al panel de administración de Channel para aprobar o rechazar esta solicitud de inmediato.
                    </div>
                </div>
                <div class="footer">
                    <p class="footer__text">&copy; 2026 Channel Scheduling System — Panel del Profesional</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

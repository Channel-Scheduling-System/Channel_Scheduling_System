export interface ServiceData {
    name: string;
    color: string;
}

export interface AppointmentScheduledEmailData {
    clientName: string;
    workerName: string;
    dateStr: string;
    timeStr: string;
    services: ServiceData[];
    notes?: string | null;
}

export function generateAppointmentScheduledHTML(
    data: AppointmentScheduledEmailData,
): string {
    // Tomamos el color del primer servicio para acentuar sutilmente partes del diseño exterior
    const primaryServiceColor = data.services[0]?.color || '#4a0010';

    const servicesRendered = data.services
        .map(
            (service) => `
        <div class="service-badge" style="border-left: 4px solid ${service.color};">
            <span class="service-badge__color-dot" style="background-color: ${service.color}; box-shadow: 0 0 10px ${service.color};"></span>
            <span class="service-badge__name">${service.name}</span>
        </div>
    `,
        )
        .join('');

    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nueva Cita Agendada - Channel</title>
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
                    background: linear-gradient(135deg, #1c1c1c 0%, #2c2c2c 100%);
                    padding: 2.5rem 2rem 2rem;
                    text-align: center;
                    position: relative;
                }
                .header__bar {
                    height: 4px;
                    background: ${primaryServiceColor};
                    margin-bottom: 1.75rem;
                    border-radius: 9999px;
                }
                .header__brand {
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 0.3em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.4);
                    margin-bottom: 0.5rem;
                }
                .header__title {
                    font-size: 1.6rem;
                    font-weight: 900;
                    color: #ffffff;
                    letter-spacing: -0.03em;
                    line-height: 1.2;
                }
                .header__subtitle {
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: #e0a96d;
                    margin-top: 0.4rem;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }
                .content {
                    background: linear-gradient(to bottom, #ffffff 0%, #faf6f6 100%);
                    padding: 2.5rem 2.5rem 2rem;
                }
                .content__greeting {
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: #3d2323;
                    margin-bottom: 0.5rem;
                }
                .content__text {
                    font-size: 0.9rem;
                    color: #6b5555;
                    font-weight: 400;
                    margin-bottom: 1.75rem;
                    line-height: 1.7;
                }
                .ticket-box {
                    background: #ffffff;
                    border: 1px solid #e8e2e1;
                    border-radius: 1rem;
                    padding: 1.75rem;
                    margin: 1.75rem 0;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                }
                .ticket-box__title {
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: #877270;
                    margin-bottom: 1rem;
                }
                .time-badge {
                    background: #1c1c1c;
                    color: #ffffff;
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                    margin-bottom: 1.25rem;
                }
                .time-badge__date {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #ffffff;
                }
                .time-badge__hours {
                    font-size: 0.85rem;
                    color: #e0a96d;
                    font-weight: 600;
                    margin-top: 0.5rem;
                }
                .services-container {
                    margin-top: 1rem;
                }
                .service-badge {
                    display: flex;
                    align-items: center;
                    background: #fdfbfc;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    margin-bottom: 0.5rem;
                    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.03);
                }
                .service-badge__color-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    display: inline-block;
                    margin-right: 0.75rem;
                    margin-top: 4px;
                    flex-shrink: 0;
                }
                .service-badge__name {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #2c2c2c;
                }
                .divider {
                    height: 1px;
                    background: #f0edec;
                    margin: 1.5rem 0;
                }
                .notes-block {
                    background: #fafafa;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    font-size: 0.85rem;
                    color: #6b5555;
                    border-left: 2px solid #e8e2e1;
                    margin-top: 1rem;
                }
                .footer {
                    background: #1c1c1c;
                    padding: 1.25rem 2rem;
                    text-align: center;
                }
                .footer__text {
                    font-size: 0.72rem;
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 500;
                }
                .footer__brand {
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.2);
                    margin-top: 0.4rem;
                }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="header">
                    <div class="header__bar"></div>
                    <p class="header__brand">Salón de Belleza Channel</p>
                    <h1 class="header__title">Tu cita ha sido agendada</h1>
                    <p class="header__subtitle">Reservado por tu profesional</p>
                </div>
                <div class="content">
                    <p class="content__greeting">Hola ${data.clientName},</p>
                    <p class="content__text">
                        Tu profesional de confianza, <strong>${data.workerName}</strong>, ha agendado una nueva cita para ti directamente en nuestro sistema de agendamiento.
                    </p>

                    <div class="ticket-box">
                        <p class="ticket-box__title">Resumen de tu Turno</p>
                        
                        <div class="time-badge">
                            <p class="time-badge__date">📅 ${data.dateStr}</p>
                            <p class="time-badge__hours">⏱ Horario: ${data.timeStr}</p>
                        </div>

                        <p class="ticket-box__title" style="margin-bottom: 0.5rem;">Servicios incluidos</p>
                        <div class="services-container">
                            ${servicesRendered}
                        </div>

                        ${
                            data.notes
                                ? `
                            <div class="notes-block">
                                <strong>Nota de tu profesional:</strong> "${data.notes}"
                            </div>
                        `
                                : ''
                        }
                    </div>

                    <div class="divider"></div>
                    <p style="font-size: 0.825rem; color: #877270; text-align: center;">
                        Si necesitas realizar algún cambio o reprogramación, por favor comunicate con el salón o vuelve a programar una cita.
                    </p>
                </div>
                <div class="footer">
                    <p class="footer__text">Este es un comprobante automático de agenda interna.</p>
                    <p class="footer__brand">&copy; 2026 Channel Scheduling System</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

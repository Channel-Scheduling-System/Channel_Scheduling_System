export interface AppointmentRejectedEmailData {
    clientName: string;
    workerName: string;
    dateStr: string;
    timeStr: string;
}

export function generateAppointmentRejectedEmailHTML(
    data: AppointmentRejectedEmailData,
): string {
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cita No Disponible - Channel</title>
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
                    background: linear-gradient(135deg, #2c2c2c 0%, #3a3a3a 60%, #1c1c1c 100%);
                    padding: 2.5rem 2rem 2rem;
                    text-align: center;
                }
                .header__bar {
                    height: 3px;
                    background: linear-gradient(90deg, #2c2c2c, #877270, #c97b1a, #877270, #2c2c2c);
                    margin-bottom: 1.75rem;
                    border-radius: 9999px;
                    opacity: 0.8;
                }
                .header__brand {
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 0.3em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.5);
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
                    color: rgba(255, 255, 255, 0.55);
                    margin-top: 0.4rem;
                }
                .content {
                    background: linear-gradient(to bottom, #faf6f6 0%, #ffffff 60%);
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
                .details-wrap {
                    background: #fdf6f6;
                    border: 1px dashed #d32f2f;
                    border-radius: 1rem;
                    padding: 1.5rem;
                    margin: 1.75rem 0;
                }
                .details-wrap__title {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #c62828;
                    letter-spacing: 0.1em;
                    margin-bottom: 0.5rem;
                }
                .details-wrap__text {
                    font-size: 0.875rem;
                    color: #5c4444;
                }
                .divider {
                    height: 1px;
                    background: #f0edec;
                    margin: 1.5rem 0;
                }
                .security-note {
                    font-size: 0.825rem;
                    color: #877270;
                    font-weight: 500;
                    line-height: 1.6;
                }
                .footer {
                    background: linear-gradient(135deg, #2c2c2c 0%, #3a3a3a 100%);
                    padding: 1.25rem 2rem;
                    text-align: center;
                }
                .footer__bar {
                    height: 2px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    margin-bottom: 1rem;
                    border-radius: 9999px;
                }
                .footer__text {
                    font-size: 0.72rem;
                    color: rgba(255, 255, 255, 0.35);
                    font-weight: 500;
                    line-height: 1.7;
                }
                .footer__brand {
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.25);
                    margin-top: 0.4rem;
                }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="header">
                    <div class="header__bar"></div>
                    <p class="header__brand">Salón de Belleza Channel</p>
                    <h1 class="header__title">Cita No Disponible</h1>
                    <p class="header__subtitle">Actualización del estado de tu solicitud</p>
                </div>
                <div class="content">
                    <p class="content__greeting">Hola ${data.clientName},</p>
                    <p class="content__text">
                        Lamentamos informarte que la solicitud de cita que realizaste con el profesional <strong>${data.workerName}</strong> no ha podido ser confirmada debido a conflictos imprevistos en la agenda o falta de disponibilidad.
                    </p>

                    <div class="details-wrap">
                        <p class="details-wrap__title">Solicitud Rechazada</p>
                        <p class="details-wrap__text">
                            <strong>Fecha original solicitada:</strong> ${data.dateStr}<br>
                            <strong>Horario original solicitado:</strong> ${data.timeStr}
                        </p>
                    </div>

                    <div class="divider"></div>

                    <div class="warning">
                        <p class="warning__text">
                            💡 Te invitamos a ingresar nuevamente a nuestro sistema de agendamiento para seleccionar un nuevo horario alternativo con ${data.workerName} u otro de nuestros profesionales disponibles.
                        </p>
                    </div>
                </div>
                <div class="footer">
                    <div class="footer__bar"></div>
                    <p class="footer__text">Este es un correo automático del sistema, por favor no respondas a este mensaje.</p>
                    <p class="footer__brand">&copy; 2026 Channel Scheduling System</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

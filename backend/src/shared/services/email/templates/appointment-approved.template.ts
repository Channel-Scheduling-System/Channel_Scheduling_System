export interface AppointmentApprovedEmailData {
    clientName: string;
    workerName: string;
    dateStr: string; // Ej: "Martes, 2 de Junio de 2026"
    timeStr: string; // Ej: "15:00"
    notes?: string | null;
}

export function generateAppointmentApprovedEmailHTML(
    data: AppointmentApprovedEmailData,
): string {
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cita Confirmada - Channel</title>
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
                    background: linear-gradient(135deg, #2c2c2c 0%, #4a0010 60%, #2c2c2c 100%);
                    padding: 2.5rem 2rem 2rem;
                    text-align: center;
                }
                .header__bar {
                    height: 3px;
                    background: linear-gradient(90deg, #2c2c2c, #ff6b6b, #4a0010, #ff6b6b, #2c2c2c);
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
                    background: linear-gradient(to bottom, #fff6f7 0%, #ffffff 60%);
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
                    background: linear-gradient(135deg, #1c1c1c 0%, #4a0010 100%);
                    border-radius: 1rem;
                    padding: 2rem;
                    margin: 1.75rem 0;
                }
                .details-wrap__header {
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 0.25em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.45);
                    margin-bottom: 1.25rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    padding-bottom: 0.5rem;
                }
                .details-grid {
                    margin-bottom: 0.5rem;
                }
                .details-grid__item {
                    margin-bottom: 1rem;
                }
                .details-grid__label {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.5);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .details-grid__value {
                    font-size: 1.1rem;
                    color: #ffffff;
                    font-weight: 700;
                }
                .divider {
                    height: 1px;
                    background: #f0edec;
                    margin: 1.5rem 0;
                }
                .info-box {
                    background: #f4f9f4;
                    border-left: 3px solid #2e7d32;
                    border-radius: 0 0.5rem 0.5rem 0;
                    padding: 0.85rem 1rem;
                    margin: 1.5rem 0;
                }
                .info-box__text {
                    font-size: 0.825rem;
                    font-weight: 600;
                    color: #1b5e20;
                    line-height: 1.5;
                }
                .footer {
                    background: linear-gradient(135deg, #2c2c2c 0%, #4a0010 100%);
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
                    <h1 class="header__title">¡Tu cita ha sido confirmada!</h1>
                </div>
                <div class="content">
                    <p class="content__greeting">Hola ${data.clientName},</p>
                    <p class="content__text">
                        Nos complace informarte que tu solicitud de cita ha sido revisada y <strong>aprobada</strong> por nuestro equipo. 
                        A continuación, encontrarás los detalles de tu reserva:
                    </p>

                    <div class="details-wrap">
                        <p class="details-wrap__header">Detalles de la Reserva</p>
                        <div class="details-grid">
                            <div class="details-grid__item">
                                <p class="details-grid__label">Profesional</p>
                                <p class="details-grid__value">${data.workerName}</p>
                            </div>
                            <div class="details-grid__item">
                                <p class="details-grid__label">Fecha</p>
                                <p class="details-grid__value">${data.dateStr}</p>
                            </div>
                            <div class="details-grid__item">
                                <p class="details-grid__label">Horario</p>
                                <p class="details-grid__value">${data.timeStr}</p>
                            </div>
                            ${
                                data.notes
                                    ? `
                            <div class="details-grid__item" style="margin-bottom: 0;">
                                <p class="details-grid__label">Notas del servicio</p>
                                <p class="details-grid__value" style="font-size: 0.95rem; font-weight: 400; color: rgba(255,255,255,0.8);">${data.notes}</p>
                            </div>
                            `
                                    : ''
                            }
                        </div>
                    </div>

                    <div class="divider"></div>

                    <div class="info-box">
                        <p class="info-box__text">
                            ✨ Te recomendamos asistir con 5 o 10 minutos de anticipación para garantizar el correcto flujo de tu atención. ¡Nos vemos pronto!
                        </p>
                    </div>
                </div>
                <div class="footer">
                    <div class="footer__bar"></div>
                    <p class="footer__text">Este es un correo automático de confirmación, por favor no respondas a este mensaje.</p>
                    <p class="footer__brand">&copy; 2026 Channel Scheduling System</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

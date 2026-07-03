import { PasswordResetData } from '../../../notification.types.js';

export function passwordResetHTML(data: PasswordResetData): string {
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Restablecimiento de Contraseña</title>
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
                    box-shadow:
                        0 32px 80px rgba(42, 0, 2, 0.22),
                        0 0 0 1px rgba(42, 0, 2, 0.06);
                }

                .header {
                    background: linear-gradient(135deg, #2c2c2c 0%, #4a0010 60%, #2c2c2c 100%);
                    padding: 2.5rem 2rem 2rem;
                    text-align: center;
                    position: relative;
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

                .divider {
                    height: 1px;
                    background: #f0edec;
                    margin: 1.5rem 0;
                }

                .otp-wrap {
                    background: linear-gradient(135deg, #1c1c1c 0%, #4a0010 100%);
                    border-radius: 1rem;
                    padding: 2rem;
                    text-align: center;
                    margin: 1.75rem 0;
                    position: relative;
                    overflow: hidden;
                }

                .otp-wrap__label {
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 0.25em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.45);
                    margin-bottom: 0.75rem;
                }

                .otp-wrap__code {
                    font-size: 2.8rem;
                    font-weight: 900;
                    letter-spacing: 0.35em;
                    font-family: 'Courier New', Courier, monospace;
                    color: #ffffff;
                    text-shadow:
                        0 0 8px  rgba(255, 255, 255, 0.9),
                        0 0 20px rgba(255, 255, 255, 0.65),
                        0 0 45px rgba(255, 180, 180, 0.5),
                        0 0 80px rgba(255, 100, 100, 0.3);
                    display: block;
                    line-height: 1;
                }

                .otp-wrap__expire {
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.45);
                    margin-top: 0.85rem;
                    letter-spacing: 0.03em;
                }

                .warning {
                    background: #fff8f0;
                    border-left: 3px solid #c97b1a;
                    border-radius: 0 0.5rem 0.5rem 0;
                    padding: 0.85rem 1rem;
                    margin: 1.5rem 0;
                }

                .warning__text {
                    font-size: 0.825rem;
                    font-weight: 600;
                    color: #7a4f1a;
                    line-height: 1.5;
                }

                .security-note {
                    font-size: 0.825rem;
                    color: #877270;
                    font-weight: 500;
                    line-height: 1.6;
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
                    <h1 class="header__title">Restablece tu contraseña</h1>
                    <p class="header__subtitle">Solicitud de recuperación de acceso</p>
                </div>

                <div class="content">
                    <p class="content__greeting">Hola,</p>
                    <p class="content__text">
                        Recibimos una solicitud para restablecer la contraseña de tu cuenta.
                        Usa el siguiente código de verificación para continuar con el proceso.
                    </p>

                    <div class="otp-wrap">
                        <p class="otp-wrap__label">Código de verificación</p>
                        <span class="otp-wrap__code">${data.otp}</span>
                        <p class="otp-wrap__expire">⏱ Expira en ${data.expiresIn} minutos</p>
                    </div>

                    <div class="divider"></div>

                    <div class="warning">
                        <p class="warning__text">
                            ⚠️ Si no solicitaste este código, ignora este correo.
                            Tu contraseña permanecerá segura y sin cambios.
                        </p>
                    </div>

                    <p class="security-note">
                        Por tu seguridad, nunca compartas este código con nadie.
                        El equipo de Channel Peluquería jamás te lo solicitará.
                    </p>
                </div>

                <div class="footer">
                    <div class="footer__bar"></div>
                    <p class="footer__text">
                        Este es un correo automático, por favor no respondas a este mensaje.
                    </p>
                    <p class="footer__brand">&copy; 2026 Channel Scheduling System</p>
                </div>

            </div>
        </body>
        </html>
    `;
}

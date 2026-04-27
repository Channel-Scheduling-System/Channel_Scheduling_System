export interface PasswordResetEmailData {
    otp: string;
    expiresInMinutes: number;
}

export function generatePasswordResetEmailHTML(data: PasswordResetEmailData): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f9f9f9;
                }
                .header {
                    background-color: #007bff;
                    color: white;
                    padding: 20px;
                    border-radius: 8px 8px 0 0;
                    text-align: center;
                }
                .content {
                    background-color: white;
                    padding: 30px;
                    border-radius: 0 0 8px 8px;
                }
                .otp-box {
                    background-color: #f0f0f0;
                    border: 2px solid #007bff;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    margin: 20px 0;
                }
                .otp-code {
                    font-size: 32px;
                    font-weight: bold;
                    color: #007bff;
                    letter-spacing: 3px;
                    font-family: monospace;
                }
                .footer {
                    background-color: #f9f9f9;
                    padding: 15px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                    border-top: 1px solid #eee;
                    margin-top: 20px;
                }
                .warning {
                    background-color: #fff3cd;
                    padding: 10px;
                    border-left: 4px solid #ffc107;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Restablecimiento de Contraseña</h1>
                </div>
                <div class="content">
                    <p>Hola,</p>
                    <p>Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código para continuar:</p>
                    
                    <div class="otp-box">
                        <div class="otp-code">${data.otp}</div>
                    </div>
                    
                    <p><strong>Este código expira en ${data.expiresInMinutes} minutos.</strong></p>
                    
                    <div class="warning">
                        <strong>⚠️ Seguridad:</strong> Si no solicitaste este código, ignora este correo. Tu contraseña seguirá siendo segura.
                    </div>
                    
                    <p>El código no se puede compartir. Nunca lo proporciones a terceros.</p>
                    
                    <div class="footer">
                        <p>Este es un correo automático. Por favor, no respondas a este mensaje.</p>
                        <p>&copy; 2026 Channel Scheduling System. Todos los derechos reservados.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

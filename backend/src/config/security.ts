import rateLimit from 'express-rate-limit';
import { env } from './env.js';
import { Request, Response, NextFunction } from 'express';

/**
 * Rate limiting para login - Protege contra fuerza bruta
 * 10 intentos cada 15 minutos
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10,
    message: 'Demasiados intentos de login. Intenta nuevamente en 15 minutos.',
    standardHeaders: true, // Retorna info de rate-limit en headers
    skip: () => env.nodeEnv === 'development',
});

/**
 * Rate limiting para registro - Intenta registrarse demasiadas veces
 * 5 intentos cada 1 hora
 */
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 60 minutos
    max: 5,
    message: 'Demasiados intentos de registro. Intenta nuevamente más tarde.',
    standardHeaders: true,
    skip: () => env.nodeEnv === 'development',
});

/**
 * Rate limiting para solicitud de reset password - Protege contra abuso
 * 5 intentos cada 60 minutos
 */
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 60 minutos
    max: 5,
    message:
        'Demasiados intentos de solicitud de restablecimiento. Intenta nuevamente más tarde.',
    standardHeaders: true,
    skip: () => env.nodeEnv === 'development',
});

/**
 * Rate limiting para verificación de código de reset - Protege contra fuerza bruta
 * 3 intentos cada 7 minutos
 */
export const verifyResetCodeLimiter = rateLimit({
    windowMs: 7 * 60 * 1000, // 7 minutos
    max: 3,
    message: 'Demasiados intentos fallidos. Intenta nuevamente en 7 minutos.',
    standardHeaders: true,
    skip: () => env.nodeEnv === 'development',
});

/**
 * Rate limiting para creación de citas - Protege contra abuso
 * 6 intentos al día por usuario rol cliente
 */
export const clientAddAppointmentLimiter = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (req.user?.role === 'CLIENT')
        return addAppointmentLimiter(req, res, next);
    next();
};

const addAppointmentLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
    max: 6,
    message:
        'Demasiados intentos de creación de citas. Intenta nuevamente mañana.',
    standardHeaders: true,
    skip: () => env.nodeEnv === 'development',
});

/**
 * Rate limiting general para API
 * 50 requests cada 5 minutos (protege contra DDoS)
 */
export const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 50,
    message: 'Demasiadas solicitudes. Intenta más tarde.',
    standardHeaders: true,
    skip: () => env.nodeEnv === 'development',
});

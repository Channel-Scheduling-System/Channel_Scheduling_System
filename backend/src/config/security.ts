import rateLimit from 'express-rate-limit';
import { env } from './env.js';
import { Request, Response, NextFunction } from 'express';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const createRateLimiter = (windowMs: number, max: number, message: string) =>
    rateLimit({
        windowMs,
        max,
        message,
        standardHeaders: true,
        skip: () => env.nodeEnv === 'development',
    });

export const loginLimiter = createRateLimiter(
    15 * MINUTE,
    10,
    'Demasiados intentos de login. Intenta nuevamente en 15 minutos.',
);

export const registerLimiter = createRateLimiter(
    HOUR,
    5,
    'Demasiados intentos de registro. Intenta nuevamente más tarde.',
);

export const passwordResetLimiter = createRateLimiter(
    HOUR,
    5,
    'Demasiados intentos de solicitud de restablecimiento. Intenta nuevamente más tarde.',
);

export const verifyResetCodeLimiter = createRateLimiter(
    7 * MINUTE,
    3,
    'Demasiados intentos fallidos. Intenta nuevamente en 7 minutos.',
);

/**
 * @note Require authMiddleware before use
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

const addAppointmentLimiter = createRateLimiter(
    DAY,
    6,
    'Demasiados intentos de creación de citas. Intenta nuevamente mañana.',
);

export const apiLimiter = createRateLimiter(
    5 * MINUTE,
    50,
    'Demasiadas solicitudes. Intenta más tarde.',
);

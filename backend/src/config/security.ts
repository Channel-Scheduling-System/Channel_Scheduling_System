import rateLimit from 'express-rate-limit';
import { env } from './env.js';

/**
 * Rate limiting para login - Protege contra fuerza bruta
 * 5 intentos cada 15 minutos
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
 * 3 intentos cada 1 hora
 */
export const registerLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 5,
    message: 'Demasiados intentos de registro. Intenta nuevamente más tarde.',
    standardHeaders: true,
    skip: () => env.nodeEnv === 'development',
});

/**
 * Rate limiting general para API
 * 100 requests cada 15 minutos (protege contra DDoS)
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    message: 'Demasiadas solicitudes. Intenta más tarde.',
    standardHeaders: true,
});

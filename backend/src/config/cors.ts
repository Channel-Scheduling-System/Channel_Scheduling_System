import cors from 'cors';
import { env } from './env.js';

/**
 * CORS configuration
 * Whitelist de orígenes permitidos
 */
export const corsOptions: cors.CorsOptions = {
    origin: [env.frontendUrl],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400, // 24 horas
};

export const corsMiddleware = cors(corsOptions);

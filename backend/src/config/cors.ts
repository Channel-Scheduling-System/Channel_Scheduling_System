import cors from 'cors';
import { env } from './env.js';

const allowedOrigins = env.frontendUrl
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

/**
 * CORS configuration
 * Whitelist de orígenes permitidos
 */
export const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`CORS: Origin not allowed -> ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400, // 24 horas
};

export const corsMiddleware = cors(corsOptions);

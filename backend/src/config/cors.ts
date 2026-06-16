import cors from 'cors';
import { env } from './env.js';
import { CorsError } from '../shared/errors/infrastructure.error.js';

const CORS_PREFLIGHT_CACHE_SECONDS = 60 * 60 * 24;

const allowedOrigins = new Set(
    env.frontendUrl
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
);

const validateOrigin = (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void,
) => {
    if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
    }
    callback(new CorsError(origin));
};

export const corsOptions: cors.CorsOptions = {
    origin: validateOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: CORS_PREFLIGHT_CACHE_SECONDS,
};

export const corsMiddleware = cors(corsOptions);

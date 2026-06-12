import { env } from '../../../config/env.js';

export const JwtConfig = {
    ACCESS: {
        secret: new TextEncoder().encode(env.jwt.secret),
        audience: 'access',
        algorithm: 'HS256',
    },
    REFRESH: {
        secret: new TextEncoder().encode(env.jwt.refresh),
        audience: 'refresh',
        algorithm: 'HS256',
    },
    RESET_PASS: {
        secret: new TextEncoder().encode(env.jwt.resetPass),
        audience: 'reset-pass',
        algorithm: 'HS256',
    },
} as const;

export const TOKEN_EXPIRATION = {
    ACCESS: env.jwt.expiresIn,
    REFRESH: env.jwt.expiresInRefresh,
    RESET_PASS: env.jwt.expiresInResetPass,
} as const;

export const TOKEN_HASH_ALGORITHM = 'sha256';
export const AUTH_EMAIL_NOT_FOUND_DELAY_MS = 2500;

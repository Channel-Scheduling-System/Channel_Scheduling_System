import { CookieOptions } from 'express';
import { env } from '../../config/env.js';

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;
const REFRESH_TOKEN_DAYS = 7;

export const REFRESH_COOKIE_NAME = 'refreshToken';

export const REFRESH_COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
    maxAge: ONE_DAY_IN_MS * REFRESH_TOKEN_DAYS,
    path: '/',
};

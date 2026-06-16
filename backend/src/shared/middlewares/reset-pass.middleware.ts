import { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env.js';
import { extractToken, assertUserIsActive } from './auth.middleware.js';
import { AUTH_ERRORS } from '../constants/messages.js';
import { verifyJwt } from '../utils/jwt.util.js';
import { JwtPayload } from '../types/jwt.js';

const RESET_PASS_SECRET = new TextEncoder().encode(env.jwt.resetPass);
const RESET_PASS_AUDIENCE = 'reset-pass';

/**
 * **Reset Password Token Middleware**
 * @description Validate the token, decode it, and verify user status.
 */
export async function resetTokenMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
) {
    try {
        const token = extractToken(req.headers.authorization);
        const payload = await verifyToken(token);
        await assertUserIsActive(payload.sub);
        req.user = payload;
        next();
    } catch (error) {
        next(error);
    }
}

async function verifyToken(token: string): Promise<JwtPayload> {
    const payload = await verifyJwt(token, {
        secret: RESET_PASS_SECRET,
        audience: RESET_PASS_AUDIENCE,
        errorMessages: {
            expired: AUTH_ERRORS.RESETPASS_TOKEN_EXPIRED,
            invalid: AUTH_ERRORS.RESETPASS_TOKEN_INVALID,
        },
    });
    return { sub: Number(payload.sub) };
}

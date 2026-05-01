import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { env } from '../../config/env.js';
import {
    CustomJwtPayload,
    extractToken,
    validateActiveUser,
} from './auth.middleware.js';
import { InvalidTokenError } from '../errors/validation.error.js';
import { AUTH_ERRORS } from '../constants/messages.js';

export async function resetTokenMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
) {
    try {
        const token = extractToken(req.headers.authorization);
        const payload = await verifyToken(token);
        await validateActiveUser(payload.sub);
        req.user = payload;
        next();
    } catch (error) {
        next(error);
    }
}

async function verifyToken(token: string): Promise<CustomJwtPayload> {
    try {
        const secret = new TextEncoder().encode(env.jwt.resetPass);
        const { payload } = await jwtVerify(token, secret, {
            audience: 'password-reset',
        });
        if (!payload.sub)
            throw new InvalidTokenError(AUTH_ERRORS.RESETPASS_TOKEN_INVALID);

        return { sub: Number(payload.sub) };
    } catch (error) {
        if (error instanceof Error && error.message.includes('expired')) {
            throw new InvalidTokenError(AUTH_ERRORS.RESETPASS_TOKEN_EXPIRED);
        }
        throw error instanceof InvalidTokenError
            ? error
            : new InvalidTokenError(AUTH_ERRORS.RESETPASS_TOKEN_INVALID);
    }
}

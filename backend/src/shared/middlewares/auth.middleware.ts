import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../types/jwt.js';
import { env } from '../../config/env.js';
import prisma from '../../config/prisma.js';
import { InvalidTokenError } from '../errors/validation.error.js';
import { UnauthorizedError } from '../errors/domain.error.js';
import { AUTH_ERRORS, USER_ERRORS } from '../constants/messages.js';
import { verifyJwt } from '../utils/jwt.util.js';

const JWT_SECRET = new TextEncoder().encode(env.jwt.secret);
const ACCESS_AUDIENCE = 'access';

/**
 * **JWT Auth Middleware**
 * @description Validate the token, decode it, and verify user status.
 */
export async function authMiddleware(
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

export function extractToken(authHeader?: string): string {
    if (!authHeader)
        throw new InvalidTokenError(AUTH_ERRORS.ACCESS_TOKEN_MISSING);

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token)
        throw new InvalidTokenError(AUTH_ERRORS.ACCESS_TOKEN_MISSING);

    return token;
}

async function verifyToken(token: string): Promise<JwtPayload> {
    const payload = await verifyJwt(token, {
        secret: JWT_SECRET,
        audience: ACCESS_AUDIENCE,
        errorMessages: {
            expired: AUTH_ERRORS.ACCESS_TOKEN_EXPIRED,
            invalid: AUTH_ERRORS.ACCESS_TOKEN_INVALID,
        },
    });
    return { sub: Number(payload.sub), role: String(payload['role']) };
}

export async function assertUserIsActive(userId: number): Promise<void> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, isActive: true },
    });
    if (!user) throw new UnauthorizedError(USER_ERRORS.NOT_FOUND);
    if (!user.isActive)
        throw new UnauthorizedError(USER_ERRORS.USER_DEACTIVATED);
}

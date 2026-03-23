import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { env } from '../../config/env.js';
import { InvalidTokenError } from '../errors/validation.error.js';

export interface CustomJwtPayload {
    sub: number;
    role?: string;
}

declare module 'express-serve-static-core' {
    interface Request {
        user?: CustomJwtPayload;
    }
}

export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        throw new InvalidTokenError('Access Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];
    try {
        const secret = new TextEncoder().encode(env.jwt.secret);
        const verified = await jwtVerify(token, secret);
        const payload = verified.payload as Record<string, unknown>;

        req.user = {
            sub: parseInt(String(payload.sub), 10),
            role: String(payload.role),
        };
        next();
    } catch {
        throw new InvalidTokenError('Access Token inválido o expirado');
    }
}

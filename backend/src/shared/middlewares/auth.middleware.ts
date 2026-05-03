import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { env } from '../../config/env.js';
import { InvalidTokenError } from '../errors/validation.error.js';
import { UnauthorizedError } from '../errors/domain.error.js';
import { AUTH_ERRORS, USER_ERRORS } from '../constants/messages.js';
import prisma from '../../config/prisma.js';

/**
 * Payload del JWT después de ser verificado.
 * Contiene la información del usuario autenticado.
 *
 * @property sub - Subject: ID único del usuario
 * @property role - Rol del usuario en el sistema (ADMIN, CLIENT, WORKER)
 */
export interface CustomJwtPayload {
    sub: number;
    role?: string;
    exp?: number;
}

/**
 * Extensión del tipo Request de Express para incluir datos del usuario autenticado.
 * Permite acceder a req.user en controladores y middlewares posteriores.
 */
declare module 'express-serve-static-core' {
    interface Request {
        user?: CustomJwtPayload;
    }
}

/**
 * **Middleware de autenticación JWT.**
 * - Verifica y valida el token de acceso en el header Authorization.
 * - Además, verifica que el usuario esté activo en la BD.
 * - Si el token es válido, extrae y almacena los datos del usuario en req.user.
 *
 * Debe ser colocado ANTES que otros middlewares y el controlador en la cadena de rutas.
 *
 * @throws InvalidTokenError - Si el token no está presente o es inválido
 * @throws UnauthorizedError - Si el usuario no existe o está inactivo
 *
 * @example
 * router.get('/protected', authMiddleware, otherMiddleware, controller.getProtected);
 */
export async function authMiddleware(
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

/**
 * Extrae el token del header Authorization
 */
export function extractToken(authHeader?: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new InvalidTokenError(AUTH_ERRORS.ACCESS_TOKEN_MISSING);
    }
    return authHeader.split(' ')[1];
}

/**
 * Verifica y decodifica el JWT
 */
async function verifyToken(token: string): Promise<CustomJwtPayload> {
    try {
        const secret = new TextEncoder().encode(env.jwt.secret);
        const { payload } = await jwtVerify(token, secret, {
            audience: 'access',
        });
        if (!payload.sub)
            throw new InvalidTokenError(AUTH_ERRORS.ACCESS_TOKEN_INVALID);

        return {
            sub: Number(payload.sub),
            role: String(payload.role),
        };
    } catch (error) {
        if (error instanceof Error && error.message.includes('expired')) {
            throw new InvalidTokenError(AUTH_ERRORS.ACCESS_TOKEN_EXPIRED);
        }
        throw error instanceof InvalidTokenError
            ? error
            : new InvalidTokenError(AUTH_ERRORS.ACCESS_TOKEN_INVALID);
    }
}

/**
 * Valida que el usuario exista y esté activo
 */
export async function validateActiveUser(userId: number): Promise<void> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, isActive: true },
    });
    if (!user) throw new UnauthorizedError(USER_ERRORS.NOT_FOUND);
    if (!user.isActive)
        throw new UnauthorizedError(USER_ERRORS.USER_DEACTIVATED);
}

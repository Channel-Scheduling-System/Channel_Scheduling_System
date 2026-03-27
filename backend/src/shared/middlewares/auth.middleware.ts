import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { env } from '../../config/env.js';
import { InvalidTokenError } from '../errors/validation.error.js';

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
 * Middleware de autenticación JWT.
 * Verifica y valida el token de acceso en el header Authorization.
 * Si el token es válido, extrae y almacena los datos del usuario en req.user.
 *
 * **Debe ser colocado ANTES que otros middlewares y el controlador en la cadena de rutas.**
 *
 * @throws InvalidTokenError - Si el token no está presente o es inválido
 *
 * @example
 * router.get('/protected', authMiddleware, otherMiddleware, controller.getProtected);
 */
export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    // Obtener el header Authorization (formato: "Bearer <token>")
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        throw new InvalidTokenError('Access Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];
    try {
        const secret = new TextEncoder().encode(env.jwt.secret);

        // Verificar y decodificar el token JWT
        const verified = await jwtVerify(token, secret);
        const payload = verified.payload as Record<string, unknown>;

        req.user = {
            sub: parseInt(String(payload.sub), 10),
            role: String(payload.role),
        };

        next();
    } catch {
        throw new InvalidTokenError('Access Token inválido');
    }
}

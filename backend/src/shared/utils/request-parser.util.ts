import type { Request } from 'express';
import type { SystemRole } from '../../modules/users/user.types.js';

/**
 * Contexto de autenticación extraído del request
 * Contiene el rol y ID del usuario autenticado
 */
export interface AuthContext {
    id: number;
    role: SystemRole;
}

/**
 * Contexto de request completo
 * Incluye el ID del recurso siendo accedido y el contexto de autenticación
 */
export interface RequestContextWithId {
    id: number;
    authId: number;
    authRole: SystemRole;
}

/**
 * Extrae y tipifica el contexto de autenticación del request
 *
 * @param req - Express Request object con user autenticado
 * @returns AuthContext con id y role tipificados
 * @throws Error si el usuario no está autenticado
 *
 * @example
 * const { id, role } = extractAuthContext(req);
 */
export function extractAuthContext(req: Request): AuthContext {
    const id = req.user?.sub as unknown as number;
    const role = req.user?.role as SystemRole;

    return { id, role };
}

/**
 * Extrae y tipifica el ID del request params y el contexto de autenticación
 * Convierte req.params.id (string) a number con validación
 *
 * @param req - Express Request object
 * @returns RequestContextWithId con id, authId y authRole tipificados
 * @throws Error si el usuario no está autenticado
 *
 * @example
 * const { id, authId, authRole } = extractRequestContextWithId(req);
 */
export function extractRequestContextWithId(
    req: Request,
): RequestContextWithId {
    const id = Number(req.params.id);
    const authId = req.user?.sub as unknown as number;
    const authRole = req.user?.role as SystemRole;

    return { id, authId, authRole };
}

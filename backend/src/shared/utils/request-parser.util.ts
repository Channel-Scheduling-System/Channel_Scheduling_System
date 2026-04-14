import type { Request } from 'express';
import type { SystemRole } from '../../modules/users/user.types.js';

/**
 * Contexto de autenticación extraído del request
 * Contiene el rol y ID del usuario autenticado
 */
export interface AuthContext {
    authRole: SystemRole;
    authId: number;
}

/**
 * Contexto de request completo
 * Incluye el ID del recurso siendo accedido y el contexto de autenticación
 */
export interface RequestContextWithId {
    id: number;
    authRole: SystemRole;
    authId: number;
}

/**
 * Extrae y tipifica el contexto de autenticación del request
 *
 * @param req - Express Request object con user autenticado
 * @returns AuthContext con authRole e authId tipificados
 * @throws Error si el usuario no está autenticado
 *
 * @example
 * const { authRole, authId } = extractAuthContext(req);
 */
export function extractAuthContext(req: Request): AuthContext {
    const authRole = req.user?.role as SystemRole;
    const authId = req.user?.sub as unknown as number;

    return { authRole, authId };
}

/**
 * Extrae y tipifica el ID del request params y el contexto de autenticación
 * Convierte req.params.id (string) a number con validación
 *
 * @param req - Express Request object
 * @returns RequestContextWithId con id, authRole e authId tipificados
 * @throws Error si el usuario no está autenticado
 *
 * @example
 * const { id, authRole, authId } = extractRequestContextWithId(req);
 */
export function extractRequestContextWithId(
    req: Request,
): RequestContextWithId {
    const id = Number(req.params.id);
    const authRole = req.user?.role as SystemRole;
    const authId = req.user?.sub as unknown as number;

    return { id, authRole, authId };
}

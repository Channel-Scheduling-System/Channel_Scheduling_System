import { Request, Response, NextFunction } from 'express';
import type { SystemRole } from '../../modules/auth/auth.types.js';
import { ForbiddenError, UnauthorizedError } from '../errors/domain.error.js';

/**
 * Middleware de validación de roles de acceso.
 * Verifica que el usuario autenticado tenga uno de los roles requeridos.
 *
 * @param requiredRoles - Un rol o array de roles permitidos
 *
 * @example
 * router.get('/admin/dashboard', requireRole('ADMIN'), controller.getDashboard);
 * router.get('/profile', requireRole(['ADMIN', 'CLIENT']), controller.getProfile);
 */
export function requireRole(requiredRoles: SystemRole | SystemRole[]) {
    const roles = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];

    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) throw new UnauthorizedError();

        const userRole = req.user.role as SystemRole;
        if (!roles.includes(userRole)) {
            throw new ForbiddenError(
                `Acceso denegado. Roles requeridos: ${roles.join(', ')}`,
            );
        }

        next();
    };
}

/**
 * Validador de rol individual
 */
export function hasRole(
    user: { role?: string } | undefined,
    role: SystemRole,
): boolean {
    return user?.role === role;
}

/**
 * Validador de múltiples roles
 */
export function hasOneOfRoles(
    user: { role?: string } | undefined,
    roles: SystemRole[],
): boolean {
    return roles.includes(user?.role as SystemRole);
}

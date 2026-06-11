import { Request, Response, NextFunction } from 'express';
import type { SystemRole } from '../../modules/auth/auth.types.js';
import { ForbiddenError, UnauthorizedError } from '../errors/domain.error.js';

/**
 * **Role access validator middleware**
 * @description Verify if the authenticated user has the required role.
 */
export function requireRole(requiredRoles: SystemRole | SystemRole[]) {
    const allowedRoles = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];

    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) return next(new UnauthorizedError());

        const userRole = req.user.role as SystemRole;
        if (!allowedRoles.includes(userRole)) {
            const message = `Acceso denegado. Roles requeridos: ${allowedRoles.join(', ')}`;
            return next(new ForbiddenError(message));
        }

        next();
    };
}

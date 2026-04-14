import type { SystemRole } from './user.types.js';
import { ForbiddenError } from '../../shared/errors/domain.error.js';

/**
 * Contexto de autenticación del usuario
 */
export interface AuthContext {
    id: number;
    role: SystemRole;
}

/**
 * Información del usuario objetivo (target)
 */
export interface TargetUser {
    id: number;
    role: SystemRole;
}

/**
 * Matriz única de permisos de roles
 * Define qué acciones puede realizar cada rol y sobre qué roles
 */
const ROLE_PERMISSIONS: Record<SystemRole, Record<string, SystemRole[]>> = {
    ADMIN: {
        create: ['ADMIN', 'WORKER', 'CLIENT'],
        view: ['WORKER', 'CLIENT'],
    },
    WORKER: {
        create: ['CLIENT'],
        view: ['CLIENT'],
    },
    CLIENT: {
        create: [],
        view: ['WORKER'],
    },
};

/**
 * Obtiene los roles que un usuario puede crear.
 */
export function getCreatableRoles(authRole: SystemRole): SystemRole[] {
    if (!authRole) return [];
    return ROLE_PERMISSIONS[authRole]?.create ?? [];
}

/**
 * Obtiene los roles que un usuario puede ver.
 */
export function getViewableRoles(authRole: SystemRole): SystemRole[] {
    return ROLE_PERMISSIONS[authRole]?.view ?? [];
}

/**
 * Valida si un usuario puede crear otro usuario.
 */
export function canCreate(
    authRole: SystemRole,
    targetRole: SystemRole,
): boolean {
    const creatableRoles = getCreatableRoles(authRole);
    return creatableRoles.includes(targetRole);
}

/**
 * Valida si un usuario puede ver otro usuario.
 * Permite que un usuario vea su propia información.
 */
export function canView(auth: AuthContext, target: TargetUser): boolean {
    // Permitir que un usuario vea su propia información
    if (auth.id === target.id) {
        return true;
    }
    const viewableRoles = getViewableRoles(auth.role);
    return viewableRoles.includes(target.role);
}

/**
 * Valida que un rol esté incluido en la lista de roles permitidos.
 * Lanza ForbiddenError si no está permitido.
 *
 * @param canAction - Resultado de la validación de permiso
 * @param errorMessage - Mensaje de error si validación falla
 * @throws ForbiddenError si targetRole no está en allowedRoles
 */
export function validateRolePermission(
    canAction: boolean,
    errorMessage: string,
): void {
    if (!canAction) {
        throw new ForbiddenError(errorMessage);
    }
}

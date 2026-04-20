import type { AuthContext } from '../../shared/utils/request-parser.util.js';
import type { SystemRole } from './user.types.js';
import { ForbiddenError } from '../../shared/errors/domain.error.js';

export type { AuthContext };

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
        update: ['WORKER', 'CLIENT'],
    },
    WORKER: {
        create: ['CLIENT'],
        view: ['CLIENT'],
        update: ['CLIENT'],
    },
    CLIENT: {
        create: [],
        view: ['WORKER'],
        update: [],
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
 * Obtiene los roles que un usuario puede actualizar (excluyendo a sí mismo).
 */
export function getUpdatableRoles(authRole: SystemRole): SystemRole[] {
    return ROLE_PERMISSIONS[authRole]?.update ?? [];
}

/**
 * Valida si un usuario puede crear otro usuario.
 */
export function canCreate(auth: AuthContext, target: TargetUser): boolean {
    const creatableRoles = getCreatableRoles(auth.role);
    return creatableRoles.includes(target.role);
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
 * Valida si un usuario puede actualizar otro usuario.
 * Permite que un usuario actualice su propia información.
 */
export function canUpdate(auth: AuthContext, target: TargetUser): boolean {
    // Permitir que un usuario actualice su propia información
    if (auth.id === target.id) {
        return true;
    }
    const updatableRoles = getUpdatableRoles(auth.role);
    return updatableRoles.includes(target.role);
}

/**
 * Valida si un usuario puede actualizar una contraseña.
 * Solo se permite actualizar la contraseña propia.
 */
export function canUpdatePassword(
    auth: AuthContext,
    target: TargetUser,
): boolean {
    return auth.id === target.id;
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

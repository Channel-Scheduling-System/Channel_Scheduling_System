import type { SystemRole } from './user.types.js';

/**
 * Valida si un usuario puede crear usuarios del rol especificado.
 *
 * Reglas:
 * - ADMIN: puede crear usuarios de cualquier rol (ADMIN, WORKER, CLIENT)
 * - WORKER: solo puede crear usuarios con rol CLIENT
 * - CLIENT: no puede crear usuarios
 *
 * @param authUserRole - Rol del usuario autenticado que intenta crear
 * @param roleToCreate - Rol del usuario que se intenta crear
 * @returns true si es permitido, false si no
 */
export function canCreateRole(
    authUserRole: SystemRole | undefined,
    roleToCreate: SystemRole,
): boolean {
    if (authUserRole === 'ADMIN') {
        return true; // ADMIN puede crear cualquier rol
    }
    if (authUserRole === 'WORKER') {
        return roleToCreate === 'CLIENT'; // WORKER solo puede crear CLIENTS
    }
    return false; // CLIENT no puede crear usuarios
}

/**
 * Valida si un usuario puede ver información de otro usuario.
 *
 * Reglas:
 * - Cualquier usuario puede ver su propia información
 * - ADMIN: puede ver usuarios con rol WORKER y CLIENT
 * - WORKER: puede ver usuarios con rol CLIENT
 * - CLIENT: puede ver usuarios con rol WORKER
 *
 * @param authUserRole - Rol del usuario autenticado que intenta ver
 * @param userRoleToView - Rol del usuario que se intenta ver
 * @param authUserId - ID del usuario autenticado (para validar acceso a su propio perfil)
 * @param userIdToView - ID del usuario que se intenta ver
 * @returns true si es permitido, false si no
 */
export function canViewRole(
    authUserRole: SystemRole | undefined,
    userRoleToView: SystemRole,
    authUserId?: number,
    userIdToView?: number,
): boolean {
    // Permitir que un usuario vea su propia información
    if (authUserId && userIdToView && authUserId === userIdToView) {
        return true;
    }

    if (authUserRole === 'ADMIN') {
        // ADMIN puede ver WORKER y CLIENT
        return userRoleToView === 'WORKER' || userRoleToView === 'CLIENT';
    }
    if (authUserRole === 'WORKER') {
        // WORKER solo puede ver CLIENT
        return userRoleToView === 'CLIENT';
    }
    if (authUserRole === 'CLIENT') {
        // CLIENT solo puede ver WORKER
        return userRoleToView === 'WORKER';
    }
    return false;
}

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

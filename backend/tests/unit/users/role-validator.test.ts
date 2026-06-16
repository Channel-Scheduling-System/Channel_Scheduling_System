/// <reference types="jest" />

import {
    getCreatableRoles,
    getViewableRoles,
    getUpdatableRoles,
    canCreate,
    canView,
    canUpdate,
    canUpdatePassword,
    canUpdateState,
    validateRolePermission,
} from '../../../src/modules/users/user-role.validator';
import { ForbiddenError } from '../../../src/shared/errors/domain.error';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const adminAuth  = { id: 1, role: 'ADMIN'  as const };
const workerAuth = { id: 2, role: 'WORKER' as const };
const clientAuth = { id: 3, role: 'CLIENT' as const };

const workerTarget = { id: 10, role: 'WORKER' as const };
const clientTarget = { id: 20, role: 'CLIENT' as const };
const adminTarget  = { id: 30, role: 'ADMIN'  as const };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('user-role.validator', () => {
    // ── getCreatableRoles ─────────────────────────────────────────────────
    describe('getCreatableRoles', () => {
        it('ADMIN can create ADMIN, WORKER and CLIENT', () => {
            expect(getCreatableRoles('ADMIN')).toEqual(
                expect.arrayContaining(['ADMIN', 'WORKER', 'CLIENT']),
            );
        });

        it('WORKER can only create CLIENT', () => {
            expect(getCreatableRoles('WORKER')).toEqual(['CLIENT']);
        });

        it('CLIENT cannot create anyone', () => {
            expect(getCreatableRoles('CLIENT')).toEqual([]);
        });

        it('should return [] when called with a falsy value (runtime guard)', () => {
            // TypeScript prevents null, but at runtime this guard can be triggered
            expect(getCreatableRoles(null as any)).toEqual([]);
        });
    });

    // ── getViewableRoles ──────────────────────────────────────────────────
    describe('getViewableRoles', () => {
        it('ADMIN can view WORKER and CLIENT', () => {
            expect(getViewableRoles('ADMIN')).toEqual(
                expect.arrayContaining(['WORKER', 'CLIENT']),
            );
        });

        it('WORKER can only view CLIENT', () => {
            expect(getViewableRoles('WORKER')).toEqual(['CLIENT']);
        });

        it('CLIENT can only view WORKER', () => {
            expect(getViewableRoles('CLIENT')).toEqual(['WORKER']);
        });

        it('should return [] for an unknown role (covers the ?? [] fallback branch)', () => {
            expect(getViewableRoles('SUPERADMIN' as any)).toEqual([]);
        });
    });

    // ── getUpdatableRoles ─────────────────────────────────────────────────
    describe('getUpdatableRoles', () => {
        it('ADMIN can update WORKER and CLIENT', () => {
            expect(getUpdatableRoles('ADMIN')).toEqual(
                expect.arrayContaining(['WORKER', 'CLIENT']),
            );
        });

        it('WORKER can update CLIENT', () => {
            expect(getUpdatableRoles('WORKER')).toEqual(['CLIENT']);
        });

        it('CLIENT cannot update anyone', () => {
            expect(getUpdatableRoles('CLIENT')).toEqual([]);
        });

        it('should return [] for an unknown role (covers the ?? [] fallback branch)', () => {
            expect(getUpdatableRoles('SUPERADMIN' as any)).toEqual([]);
        });
    });

    // ── canCreate ─────────────────────────────────────────────────────────
    describe('canCreate', () => {
        it('ADMIN can create a WORKER', () => {
            expect(canCreate(adminAuth, workerTarget)).toBe(true);
        });

        it('WORKER cannot create an ADMIN', () => {
            expect(canCreate(workerAuth, adminTarget)).toBe(false);
        });

        it('CLIENT cannot create a WORKER', () => {
            expect(canCreate(clientAuth, workerTarget)).toBe(false);
        });
    });

    // ── canView ───────────────────────────────────────────────────────────
    describe('canView', () => {
        it('should allow viewing own profile regardless of role', () => {
            // clientAuth.id === clientTarget.id → true
            const ownTarget = { id: clientAuth.id, role: 'CLIENT' as const };
            expect(canView(clientAuth, ownTarget)).toBe(true);
        });

        it('ADMIN can view a WORKER', () => {
            expect(canView(adminAuth, workerTarget)).toBe(true);
        });

        it('WORKER can view a CLIENT', () => {
            expect(canView(workerAuth, clientTarget)).toBe(true);
        });

        it('WORKER cannot view an ADMIN', () => {
            expect(canView(workerAuth, adminTarget)).toBe(false);
        });
    });

    // ── canUpdate ─────────────────────────────────────────────────────────
    describe('canUpdate', () => {
        it('should allow updating own profile', () => {
            const ownTarget = { id: workerAuth.id, role: 'WORKER' as const };
            expect(canUpdate(workerAuth, ownTarget)).toBe(true);
        });

        it('ADMIN can update a CLIENT', () => {
            expect(canUpdate(adminAuth, clientTarget)).toBe(true);
        });

        it('CLIENT cannot update a WORKER', () => {
            expect(canUpdate(clientAuth, workerTarget)).toBe(false);
        });
    });

    // ── canUpdatePassword ─────────────────────────────────────────────────
    describe('canUpdatePassword', () => {
        it('should return true when auth id matches target id', () => {
            const ownTarget = { id: adminAuth.id, role: 'ADMIN' as const };
            expect(canUpdatePassword(adminAuth, ownTarget)).toBe(true);
        });

        it('should return false for another user', () => {
            expect(canUpdatePassword(adminAuth, workerTarget)).toBe(false);
        });
    });

    // ── canUpdateState ────────────────────────────────────────────────────
    describe('canUpdateState', () => {
        it('should return false when trying to update own state', () => {
            const ownTarget = { id: adminAuth.id, role: 'ADMIN' as const };
            expect(canUpdateState(adminAuth, ownTarget)).toBe(false);
        });

        it('ADMIN can update the state of a WORKER', () => {
            expect(canUpdateState(adminAuth, workerTarget)).toBe(true);
        });

        it('CLIENT cannot update the state of a WORKER', () => {
            expect(canUpdateState(clientAuth, workerTarget)).toBe(false);
        });
    });

    // ── validateRolePermission ────────────────────────────────────────────
    describe('validateRolePermission', () => {
        it('should NOT throw when canAction is true', () => {
            expect(() => validateRolePermission(true, 'Forbidden')).not.toThrow();
        });

        it('should throw ForbiddenError when canAction is false', () => {
            expect(() => validateRolePermission(false, 'Access denied')).toThrow(
                ForbiddenError,
            );
        });

        it('ForbiddenError should contain the provided message', () => {
            try {
                validateRolePermission(false, 'No tienes permiso');
            } catch (err: any) {
                expect(err.message).toBe('No tienes permiso');
            }
        });
    });
});

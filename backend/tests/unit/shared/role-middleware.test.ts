/// <reference types="jest" />

import { requireRole } from '../../../src/shared/middlewares/role.middleware';
import { ForbiddenError, UnauthorizedError } from '../../../src/shared/errors/domain.error';

// ─── Helper ───────────────────────────────────────────────────────────────────
function buildReq(role?: string) {
    return { user: role ? { sub: 1, role } : undefined } as any;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('role.middleware', () => {
    // ── requireRole ───────────────────────────────────────────────────────
    describe('requireRole', () => {
        it('should call next() when user has the required role (single role)', () => {
            const middleware = requireRole('ADMIN');
            const req = buildReq('ADMIN');
            const next = jest.fn();

            middleware(req, {} as any, next);

            expect(next).toHaveBeenCalledWith();
        });

        it('should call next() when user has one of the required roles (array)', () => {
            const middleware = requireRole(['ADMIN', 'WORKER']);
            const req = buildReq('WORKER');
            const next = jest.fn();

            middleware(req, {} as any, next);

            expect(next).toHaveBeenCalledWith();
        });

        it('should throw UnauthorizedError when req.user is not set', () => {
            const middleware = requireRole('ADMIN');
            const req = { user: undefined } as any;
            const next = jest.fn();

            expect(() => middleware(req, {} as any, next)).toThrow(UnauthorizedError);
        });

        it('should throw ForbiddenError when user does not have the required role', () => {
            const middleware = requireRole('ADMIN');
            const req = buildReq('CLIENT');
            const next = jest.fn();

            expect(() => middleware(req, {} as any, next)).toThrow(ForbiddenError);
        });

        it('should include the required roles in the ForbiddenError message', () => {
            const middleware = requireRole(['ADMIN', 'WORKER']);
            const req = buildReq('CLIENT');
            try {
                middleware(req, {} as any, jest.fn());
            } catch (err: any) {
                expect(err.message).toContain('ADMIN');
                expect(err.message).toContain('WORKER');
            }
        });

        it('should normalise a single role string into an array internally', () => {
            // Passes when a single string (not array) is given
            const middleware = requireRole('CLIENT');
            const req = buildReq('CLIENT');
            const next = jest.fn();
            middleware(req, {} as any, next);
            expect(next).toHaveBeenCalledWith();
        });
    });
});

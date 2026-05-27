/// <reference types="jest" />

import {
    DomainError,
    ServiceError,
    NotFoundError,
    ConflictError,
    BusinessValidationError,
    UnauthorizedError,
    ForbiddenError,
    TokenReuseError,
} from '../../../src/shared/errors/domain.error';

describe('Domain error classes', () => {
    // ── DomainError (base) ────────────────────────────────────────────────
    describe('DomainError', () => {
        it('should set message, status and code with defaults', () => {
            const err = new DomainError('Something failed');
            expect(err.message).toBe('Something failed');
            expect(err.status).toBe(400);
            expect(err.code).toBe('DOMAIN_ERROR');
            expect(err.name).toBe('DomainError');
            expect(err).toBeInstanceOf(Error);
        });

        it('should accept custom status and code', () => {
            const err = new DomainError('Custom', 418, 'CUSTOM_CODE');
            expect(err.status).toBe(418);
            expect(err.code).toBe('CUSTOM_CODE');
        });
    });

    // ── ServiceError ──────────────────────────────────────────────────────
    describe('ServiceError', () => {
        it('should have status 503 and code SERVICE_ERROR', () => {
            const err = new ServiceError('External service down');
            expect(err.status).toBe(503);
            expect(err.code).toBe('SERVICE_ERROR');
            expect(err).toBeInstanceOf(DomainError);
        });
    });

    // ── NotFoundError ─────────────────────────────────────────────────────
    describe('NotFoundError', () => {
        it('should have status 404 and code NOT_FOUND_ERROR', () => {
            const err = new NotFoundError('Resource not found');
            expect(err.status).toBe(404);
            expect(err.code).toBe('NOT_FOUND_ERROR');
            expect(err.message).toBe('Resource not found');
        });
    });

    // ── ConflictError ─────────────────────────────────────────────────────
    describe('ConflictError', () => {
        it('should have status 409 and code CONFLICT_ERROR', () => {
            const err = new ConflictError('Duplicate entry');
            expect(err.status).toBe(409);
            expect(err.code).toBe('CONFLICT_ERROR');
        });
    });

    // ── BusinessValidationError ───────────────────────────────────────────
    describe('BusinessValidationError', () => {
        it('should have status 422 and code BUSINESS_VALIDATION_ERROR', () => {
            const err = new BusinessValidationError('Constraint violated');
            expect(err.status).toBe(422);
            expect(err.code).toBe('BUSINESS_VALIDATION_ERROR');
        });
    });

    // ── UnauthorizedError ─────────────────────────────────────────────────
    describe('UnauthorizedError', () => {
        it('should use default message and have status 401', () => {
            const err = new UnauthorizedError();
            expect(err.status).toBe(401);
            expect(err.code).toBe('UNAUTHORIZED_ERROR');
            expect(err.message).toBe('No autorizado');
        });

        it('should accept a custom message', () => {
            const err = new UnauthorizedError('Token expired');
            expect(err.message).toBe('Token expired');
        });
    });

    // ── ForbiddenError ────────────────────────────────────────────────────
    describe('ForbiddenError', () => {
        it('should use default message and have status 403', () => {
            const err = new ForbiddenError();
            expect(err.status).toBe(403);
            expect(err.code).toBe('FORBIDDEN_ERROR');
            expect(err.message).toBe('Acceso prohibido');
        });

        it('should accept a custom message', () => {
            const err = new ForbiddenError('Not your resource');
            expect(err.message).toBe('Not your resource');
        });
    });

    // ── TokenReuseError ───────────────────────────────────────────────────
    describe('TokenReuseError', () => {
        it('should use default message and have status 401', () => {
            const err = new TokenReuseError();
            expect(err.status).toBe(401);
            expect(err.code).toBe('TOKEN_REUSE_ERROR');
            expect(err.message).toBe('Reutilización de token detectada');
        });
    });
});

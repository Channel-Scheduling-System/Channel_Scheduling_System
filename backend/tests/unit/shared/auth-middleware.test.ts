/// <reference types="jest" />

/**
 * Tests for the exported helpers in auth.middleware.ts.
 * The full authMiddleware / validateActiveUser (which call Prisma) are covered
 * by integration tests; only the pure-logic helpers are unit-tested here.
 */

// Must be the first thing — jest.mock calls are hoisted before any import
jest.mock('jose', () => ({ jwtVerify: jest.fn() }), { virtual: true });

jest.mock('../../../src/config/env', () => ({
    env: {
        jwt: {
            secret: 'test-jwt-secret',
            expiresIn: '1h',
            refresh: 'test-refresh',
            expiresInRefresh: '7d',
            resetPass: 'test-reset',
            expiresInResetPass: '15m',
        },
        token: { secret: 'token-secret' },
    },
}));

jest.mock('../../../src/config/prisma', () => ({
    __esModule: true,
    default: { user: { findUnique: jest.fn() } },
}));

import { extractToken } from '../../../src/shared/middlewares/auth.middleware';
import { InvalidTokenError } from '../../../src/shared/errors/validation.error';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('auth.middleware – extractToken', () => {
    it('should return the token when Authorization header is valid', () => {
        expect(extractToken('Bearer my.valid.jwt')).toBe('my.valid.jwt');
    });

    it('should throw InvalidTokenError when the header is missing', () => {
        expect(() => extractToken(undefined)).toThrow(InvalidTokenError);
    });

    it('should throw InvalidTokenError when header does not start with "Bearer "', () => {
        expect(() => extractToken('Basic sometoken')).toThrow(InvalidTokenError);
    });

    it('should throw InvalidTokenError for an empty string', () => {
        expect(() => extractToken('')).toThrow(InvalidTokenError);
    });

    it('should throw InvalidTokenError for a header without the space after Bearer', () => {
        expect(() => extractToken('Bearertoken')).toThrow(InvalidTokenError);
    });
});

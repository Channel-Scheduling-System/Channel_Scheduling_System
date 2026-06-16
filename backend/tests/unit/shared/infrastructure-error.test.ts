/// <reference types="jest" />

import {
    InfrastructureError,
    DatabaseConnectionError,
    CorsError,
} from '../../../src/shared/errors/infrastructure.error';

describe('infrastructure errors', () => {
    describe('InfrastructureError', () => {
        it('should set message, status, and code from constructor', () => {
            const err = new InfrastructureError('Server error', 502, 'CUSTOM');
            expect(err.message).toBe('Server error');
            expect(err.status).toBe(502);
            expect(err.code).toBe('CUSTOM');
            expect(err).toBeInstanceOf(Error);
        });

        it('should default to 500 and INFRASTRUCTURE_ERROR when not provided', () => {
            const err = new InfrastructureError('generic');
            expect(err.status).toBe(500);
            expect(err.code).toBe('INFRASTRUCTURE_ERROR');
        });
    });

    describe('DatabaseConnectionError', () => {
        it('should set 503 status and DATABASE_CONNECTION_ERROR code', () => {
            const err = new DatabaseConnectionError();
            expect(err.status).toBe(503);
            expect(err.code).toBe('DATABASE_CONNECTION_ERROR');
            expect(err.message).toBe('Database connection failed');
            expect(err).toBeInstanceOf(InfrastructureError);
        });

        it('should accept a custom message', () => {
            const err = new DatabaseConnectionError('Could not reach DB');
            expect(err.message).toBe('Could not reach DB');
            expect(err.status).toBe(503);
        });
    });

    describe('CorsError', () => {
        it('should set 403 status, CORS_ERROR code, and include origin in message', () => {
            const err = new CorsError('https://evil.com');
            expect(err.status).toBe(403);
            expect(err.code).toBe('CORS_ERROR');
            expect(err.message).toContain('https://evil.com');
            expect(err).toBeInstanceOf(InfrastructureError);
        });
    });
});

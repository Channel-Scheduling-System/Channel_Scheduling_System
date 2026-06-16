/// <reference types="jest" />

import {
    ValidationError,
    ValidationDTOError,
    InvalidCredentialsError,
    InvalidTokenError,
} from '../../../src/shared/errors/validation.error';

describe('Validation error classes', () => {
    // ── ValidationError (base) ────────────────────────────────────────────
    describe('ValidationError', () => {
        it('should set message, status and code with defaults', () => {
            const err = new ValidationError('Invalid input');
            expect(err.message).toBe('Invalid input');
            expect(err.status).toBe(400);
            expect(err.code).toBe('VALIDATION_ERROR');
            expect(err.name).toBe('ValidationError');
            expect(err).toBeInstanceOf(Error);
        });

        it('should accept custom status and code', () => {
            const err = new ValidationError('Custom', 422, 'MY_CODE');
            expect(err.status).toBe(422);
            expect(err.code).toBe('MY_CODE');
        });
    });

    // ── ValidationDTOError ────────────────────────────────────────────────
    describe('ValidationDTOError', () => {
        it('should store validation errors and have status 400', () => {
            const errors = { field: 'required' };
            const err = new ValidationDTOError(errors);
            expect(err.errors).toEqual(errors);
            expect(err.status).toBe(400);
            expect(err.code).toBe('VALIDATION_DTO_ERROR');
            expect(err.message).toBe('Validación de datos fallida');
            expect(err).toBeInstanceOf(ValidationError);
        });
    });

    // ── InvalidCredentialsError ───────────────────────────────────────────
    describe('InvalidCredentialsError', () => {
        it('should use default message and have status 401', () => {
            const err = new InvalidCredentialsError();
            expect(err.status).toBe(401);
            expect(err.code).toBe('INVALID_CREDENTIALS_ERROR');
            expect(err.message).toBe('Credenciales inválidas');
        });

        it('should accept a custom message', () => {
            const err = new InvalidCredentialsError('Bad password');
            expect(err.message).toBe('Bad password');
        });
    });

    // ── InvalidTokenError ─────────────────────────────────────────────────
    describe('InvalidTokenError', () => {
        it('should use default message and have status 401', () => {
            const err = new InvalidTokenError();
            expect(err.status).toBe(401);
            expect(err.code).toBe('INVALID_TOKEN_ERROR');
            expect(err.message).toBe('Token inválido o expirado');
        });

        it('should accept a custom message', () => {
            const err = new InvalidTokenError('JWT expired');
            expect(err.message).toBe('JWT expired');
        });
    });
});

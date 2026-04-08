/// <reference types="jest" />

import {
    LoginDTO,
    RefreshTokenDTO,
    RegisterDTO,
} from '../../../src/modules/auth/auth.validator';

describe('Auth DTO validators', () => {
    it('should validate a correct RegisterDTO payload', () => {
        const result = RegisterDTO.safeParse({
            firstName: 'Johan',
            lastName: 'Gil',
            alias: 'johangil',
            email: 'johan@test.com',
            phone: '3001234567',
            password: 'Password123!',
            role: 'ADMIN',
        });

        expect(result.success).toBe(true);
    });

    it('should reject RegisterDTO with short password', () => {
        const result = RegisterDTO.safeParse({
            firstName: 'Johan',
            lastName: 'Gil',
            alias: 'johangil',
            email: 'johan@test.com',
            password: '123',
            role: 'ADMIN',
        });

        expect(result.success).toBe(false);
    });

    it('should reject RegisterDTO with unknown fields due to strict mode', () => {
        const result = RegisterDTO.safeParse({
            firstName: 'Johan',
            lastName: 'Gil',
            alias: 'johangil',
            email: 'johan@test.com',
            password: 'Password123',
            role: 'ADMIN',
            extraField: 'not-allowed',
        });

        expect(result.success).toBe(false);
    });

    it('should reject LoginDTO without identifier', () => {
        const result = LoginDTO.safeParse({
            password: 'Password123',
        });

        expect(result.success).toBe(false);
    });

    it('should reject LoginDTO with invalid identifier', () => {
        const result = LoginDTO.safeParse({
            identifier: 'inv@lid',
            password: 'Password123!',
        });

        expect(result.success).toBe(false);
    });

    it('should reject RefreshTokenDTO with invalid format', () => {
        const result = RefreshTokenDTO.safeParse('invalid-token');

        expect(result.success).toBe(false);
    });

    it('should reject RefreshTokenDTO when token is missing', () => {
        const result = RefreshTokenDTO.safeParse('');

        expect(result.success).toBe(false);
    });

    it('should reject RefreshTokenDTO with invalid code length', () => {
        const result = RefreshTokenDTO.safeParse(
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ',
        );

        expect(result.success).toBe(false);
        });

    it('should validate RefreshTokenDTO with enough length', () => {
        const result = RefreshTokenDTO.safeParse(
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        );

        expect(result.success).toBe(true);
    });
});

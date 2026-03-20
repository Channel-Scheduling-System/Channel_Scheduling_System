/// <reference types="jest" />

import {
    LoginDTO,
    RecoveryRequestDTO,
    RefreshTokenDTO,
    RegisterDTO,
    ResetPasswordDTO,
} from '../../src/modules/auth/auth.validator';

describe('Auth DTO validators', () => {
    it('should validate a correct RegisterDTO payload', () => {
        const result = RegisterDTO.safeParse({
            firstName: 'Johan',
            lastName: 'Gil',
            alias: 'johangil',
            email: 'johan@test.com',
            phone: '3001234567',
            password: 'Password123',
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

    it('should reject RecoveryRequestDTO with invalid email', () => {
        const result = RecoveryRequestDTO.safeParse({
            email: 'invalid-email',
        });

        expect(result.success).toBe(false);
    });

    it('should reject ResetPasswordDTO with invalid code length', () => {
        const result = ResetPasswordDTO.safeParse({
            email: 'johan@test.com',
            code: '123',
            newPassword: 'Password123',
        });

        expect(result.success).toBe(false);
    });

    it('should validate RefreshTokenDTO with enough length', () => {
        const result = RefreshTokenDTO.safeParse({
            refreshToken: '1234567890abcd',
        });

        expect(result.success).toBe(true);
    });
});

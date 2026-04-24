/// <reference types="jest" />

import {
    CreateFirstAdminDTO,
    CreateUserInput,
    UpdatePasswordDTO,
    UpdateUserDTO,
    UserFiltersSchema,
    UserQuerySchema,
} from '../../../src/modules/users/user.validator';

describe('User DTO validators', () => {
    it('should validate a correct CreateUserInput payload', () => {
        const result = CreateUserInput.safeParse({
            alias: 'johangil',
            firstName: 'Johan',
            lastName: 'Gil',
            phone: '3001234567',
            email: 'johan@test.com',
            password: 'Password123!',
            role: 'CLIENT',
        });

        expect(result.success).toBe(true);
    });

    it('should reject CreateUserInput with missing password', () => {
        const result = CreateUserInput.safeParse({
            alias: 'johangil',
            firstName: 'Johan',
            lastName: 'Gil',
            phone: '3001234567',
            email: 'johan@test.com',
            role: 'CLIENT',
        });

        expect(result.success).toBe(false);
    });

    it('should validate CreateFirstAdminInput payload', () => {
        const result = CreateFirstAdminDTO.safeParse({
            alias: 'adminone',
            firstName: 'Admin',
            lastName: 'One',
            phone: '3000000001',
            email: 'admin@test.com',
            password: 'Password123!',
            secretCode: '1234567890',
        });

        expect(result.success).toBe(true);
    });

    it('should reject CreateFirstAdminInput without secretCode', () => {
        const result = CreateFirstAdminDTO.safeParse({
            alias: 'adminone',
            firstName: 'Admin',
            lastName: 'One',
            phone: '3000000001',
            email: 'admin@test.com',
            password: 'Password123!',
        });

        expect(result.success).toBe(false);
    });

    it('should validate UpdateUserInput payload', () => {
        const result = UpdateUserDTO.safeParse({
            firstName: 'Carlos',
            lastName: 'Gil',
        });

        expect(result.success).toBe(true);
    });

    it('should reject UpdateUserInput with role field', () => {
        const result = UpdateUserDTO.safeParse({
            id: 1,
            role: 'ADMIN',
        });

        expect(result.success).toBe(false);
    });

    it('should validate UpdatePasswordInput payload', () => {
        const result = UpdatePasswordDTO.safeParse({
            password: 'OldPass123!',
            newPassword: 'NewPass123!',
        });

        expect(result.success).toBe(true);
    });

    it('should reject UpdatePasswordInput with invalid password', () => {
        const result = UpdatePasswordDTO.safeParse({
            password: 'old',
            newPassword: 'NewPass123!',
        });

        expect(result.success).toBe(false);
    });

    it('should validate UserFiltersSchema with role and identifier', () => {
        const result = UserFiltersSchema.safeParse({
            role: 'ADMIN',
            identifier: 'johan',
        });

        expect(result.success).toBe(true);
    });

    it('should validate UserQuerySchema with pagination and filters', () => {
        const result = UserQuerySchema.safeParse({
            page: '2',
            limit: '10',
            role: ['ADMIN', 'WORKER'],
            isActive: 'true',
        });

        expect(result.success).toBe(true);
    });
});

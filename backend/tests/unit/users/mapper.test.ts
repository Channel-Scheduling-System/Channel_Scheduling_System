/// <reference types="jest" />

import {
    mapToUserResponse,
    mapToUsersResponse,
} from '../../../src/modules/users/user.mapper';

function buildUser(overrides: Record<string, unknown> = {}) {
    return {
        id: 1,
        alias: 'johangil',
        firstName: 'Johan',
        lastName: 'Gil',
        phone: '3001234567',
        email: 'johan@test.com',
        role: 'CLIENT',
        isActive: true,
        passwordHash: 'hash',
        mustChangePwd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    } as any;
}

describe('user.mapper', () => {
    describe('mapToUserResponse', () => {
        it('should map a User entity to a UserResponse', () => {
            const user = buildUser();

            const result = mapToUserResponse(user);

            expect(result).toEqual({
                id: 1,
                alias: 'johangil',
                firstName: 'Johan',
                lastName: 'Gil',
                phone: '3001234567',
                email: 'johan@test.com',
                role: 'CLIENT',
                isActive: true,
            });
            // Internal fields must not be exposed
            expect(result).not.toHaveProperty('passwordHash');
            expect(result).not.toHaveProperty('mustChangePwd');
        });

        it('should handle null phone', () => {
            const user = buildUser({ phone: null });
            const result = mapToUserResponse(user);
            expect(result.phone).toBeNull();
        });

        it('should reflect the isActive flag correctly', () => {
            const activeUser = buildUser({ isActive: false });
            expect(mapToUserResponse(activeUser).isActive).toBe(false);
        });
    });

    describe('mapToUsersResponse', () => {
        it('should map an array of users', () => {
            const users = [
                buildUser({ id: 1, alias: 'a' }),
                buildUser({ id: 2, alias: 'b' }),
            ];

            const result = mapToUsersResponse(users);

            expect(result).toHaveLength(2);
            expect(result[0].alias).toBe('a');
            expect(result[1].alias).toBe('b');
        });

        it('should return an empty array for an empty input', () => {
            expect(mapToUsersResponse([])).toEqual([]);
        });
    });
});

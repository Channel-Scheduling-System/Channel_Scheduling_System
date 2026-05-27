/// <reference types="jest" />

import {
    mapToAuthUser,
    mapToAuthResultResponse,
} from '../../../src/modules/auth/auth.mapper';

describe('auth.mapper', () => {
    describe('mapToAuthUser', () => {
        it('should concatenate firstName and lastName into name', () => {
            const user = {
                id: 1,
                firstName: 'Johan',
                lastName: 'Gil',
                alias: 'johangil',
                role: 'ADMIN',
                email: 'j@g.com',
                phone: null,
                isActive: true,
            } as any;

            const result = mapToAuthUser(user);

            expect(result).toEqual({
                id: 1,
                name: 'Johan Gil',
                alias: 'johangil',
                role: 'ADMIN',
            });
        });

        it('should handle middle names correctly', () => {
            const user = {
                id: 5,
                firstName: 'María',
                lastName: 'Pérez',
                alias: 'mariap',
                role: 'CLIENT',
                email: 'm@p.com',
                phone: null,
                isActive: true,
            } as any;

            const result = mapToAuthUser(user);

            expect(result.name).toBe('María Pérez');
            expect(result.role).toBe('CLIENT');
        });
    });

    describe('mapToAuthResultResponse', () => {
        it('should return user and accessToken only', () => {
            const authResult = {
                user: { id: 1, name: 'Johan Gil', alias: 'johangil', role: 'ADMIN' as const },
                tokens: {
                    accessToken: 'access-token-value',
                    refreshToken: 'refresh-token-value',
                },
            };

            const result = mapToAuthResultResponse(authResult);

            expect(result).toEqual({
                user: authResult.user,
                token: 'access-token-value',
            });
            // The refresh token must NOT be exposed in the response
            expect(result).not.toHaveProperty('refreshToken');
        });
    });
});

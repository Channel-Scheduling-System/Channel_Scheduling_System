/// <reference types="jest" />

import bcrypt from 'bcrypt';

import { AuthService } from '../../../src/modules/auth/auth.service';
import type { IAuthRepository } from '../../../src/modules/auth/auth.repository';
import { ConflictError } from '../../../src/shared/errors/domain.error';
import { InvalidCredentialsError } from '../../../src/shared/errors/validation.error';

jest.mock('#/config/env.js', () => ({
    __esModule: true,
    env: {
        jwt: {
            secret: 'test-jwt-secret',
            expiresIn: '1h',
            refresh: 'test-jwt-refresh',
            expiresInRefresh: '7d',
        },
    },
}));

jest.mock('bcrypt', () => ({
    __esModule: true,
    default: {
        compare: jest.fn(),
        hash: jest.fn(),
    },
}));

jest.mock(
    'jose',
    () => ({
        __esModule: true,
        SignJWT: jest
            .fn()
            .mockImplementation((payload: { sub: string; role: string }) => ({
                setProtectedHeader: jest.fn().mockReturnThis(),
                setExpirationTime: jest.fn().mockReturnThis(),
                sign: jest.fn().mockImplementation(async () => {
                    const exp = Math.floor(Date.now() / 1000) + 3600;
                    const encodedPayload = Buffer.from(
                        JSON.stringify({
                            sub: payload.sub,
                            role: payload.role,
                            exp,
                        }),
                    ).toString('base64');
                    return `header.${encodedPayload}.signature`;
                }),
            })),
        jwtVerify: jest.fn().mockResolvedValue({ payload: {} }),
    }),
    { virtual: true },
);

const bcryptMock = bcrypt as unknown as {
    compare: jest.Mock;
    hash: jest.Mock;
};

function createRepoMock(): jest.Mocked<IAuthRepository> {
    return {
        findUserByIdentifier: jest.fn(),
        findUserByEmail: jest.fn(),
        findUserById: jest.fn(),
        createUser: jest.fn(),
        updatePassword: jest.fn(),
        createRefreshToken: jest.fn(),
        findRefreshToken: jest.fn(),
        findRefreshTokenByUserAndHash: jest.fn(),
        invalidateRefreshToken: jest.fn(),
        deleteRefreshTokensForUser: jest.fn(),
        createRecoveryCode: jest.fn(),
        findValidRecoveryCode: jest.fn(),
        markRecoveryCodeAsUsed: jest.fn(),
        invalidateRecoveryCodes: jest.fn(),
        countAdminUsers: jest.fn(),
    };
}

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should login user with valid credentials', async () => {
        const repo = createRepoMock();
        const service = new AuthService(repo);

        repo.findUserByIdentifier.mockResolvedValue({
            id: 1,
            firstName: 'Johan',
            lastName: 'Gil',
            alias: 'johangil',
            role: 'ADMIN',
            passwordHash: 'hash',
        } as any);
        bcryptMock.compare.mockResolvedValue(true);
        repo.deleteRefreshTokensForUser.mockResolvedValue();
        repo.createRefreshToken.mockResolvedValue();

        const result = await service.login({
            identifier: 'johangil',
            password: 'Password123',
        });

        expect(result).toEqual({
            user: {
                id: 1,
                name: 'Johan Gil',
                alias: 'johangil',
                role: 'ADMIN',
            },
            tokens: {
                accessToken: expect.any(String),
                refreshToken: expect.any(String),
            },
        });
        expect(repo.findUserByIdentifier).toHaveBeenCalledWith('johangil');
        expect(bcryptMock.compare).toHaveBeenCalledWith('Password123', 'hash');
        expect(repo.deleteRefreshTokensForUser).toHaveBeenCalledWith(1);
        expect(repo.createRefreshToken).toHaveBeenCalledWith(
            1,
            expect.any(String),
            expect.any(Date),
        );
    });

    it('should throw InvalidCredentialsError when user is not found', async () => {
        const repo = createRepoMock();
        const service = new AuthService(repo);

        repo.findUserByIdentifier.mockResolvedValue(null);

        await expect(
            service.login({ identifier: 'missing', password: 'Password123' }),
        ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it('should throw InvalidCredentialsError when password does not match', async () => {
        const repo = createRepoMock();
        const service = new AuthService(repo);

        repo.findUserByIdentifier.mockResolvedValue({
            id: 1,
            firstName: 'Johan',
            lastName: 'Gil',
            alias: 'johangil',
            role: 'ADMIN',
            passwordHash: 'hash',
        } as any);
        bcryptMock.compare.mockResolvedValue(false);

        await expect(
            service.login({
                identifier: 'johangil',
                password: 'wrong-password',
            }),
        ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it('should throw ConflictError when email already exists', async () => {
        const repo = createRepoMock();
        const service = new AuthService(repo);

        repo.findUserByEmail.mockResolvedValue({ id: 99 } as any);

        await expect(
            service.register({
                firstName: 'Johan',
                lastName: 'Gil',
                alias: 'johangil',
                email: 'johan@test.com',
                password: 'Password123',
                role: 'ADMIN',
            }),
        ).rejects.toBeInstanceOf(ConflictError);
        expect(repo.createUser).not.toHaveBeenCalled();
    });

    it('should register user and hash password', async () => {
        const repo = createRepoMock();
        const service = new AuthService(repo);

        repo.findUserByEmail.mockResolvedValue(null);
        bcryptMock.hash.mockResolvedValue('hashed-password');
        repo.createRefreshToken.mockResolvedValue();
        repo.createUser.mockResolvedValue({
            id: 5,
            firstName: 'Johan',
            lastName: 'Gil',
            alias: 'johangil',
            role: 'ADMIN',
        } as any);

        const result = await service.register({
            firstName: 'Johan',
            lastName: 'Gil',
            alias: 'johangil',
            email: 'johan@test.com',
            phone: '3001234567',
            password: 'Password123',
            role: 'ADMIN',
        });

        expect(bcryptMock.hash).toHaveBeenCalledWith('Password123', 10);
        expect(repo.createUser).toHaveBeenCalledWith(
            expect.objectContaining({
                email: 'johan@test.com',
                passwordHash: 'hashed-password',
            }),
        );
        expect(result).toEqual({
            user: {
                id: 5,
                name: 'Johan Gil',
                alias: 'johangil',
                role: 'ADMIN',
            },
            tokens: {
                accessToken: expect.any(String),
                refreshToken: expect.any(String),
            },
        });
        expect(repo.createRefreshToken).toHaveBeenCalledWith(
            5,
            expect.any(String),
            expect.any(Date),
        );
    });
});

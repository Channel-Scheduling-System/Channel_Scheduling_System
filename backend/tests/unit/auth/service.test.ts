/// <reference types="jest" />

import bcrypt from 'bcrypt';
import { createHmac } from 'crypto';

import { AuthService } from '../../../src/modules/auth/auth.service';
import type { IAuthRepository } from '../../../src/modules/auth/auth.repository';
import type { IUserService } from '../../../src/modules/users/user.service';
import {
    ConflictError,
    TokenReuseError,
} from '../../../src/shared/errors/domain.error';
import { InvalidCredentialsError } from '../../../src/shared/errors/validation.error';

jest.mock('#/config/env.js', () => ({
    __esModule: true,
    env: {
        token: {
            secret: 'test-token-secret',
        },
        jwt: {
            secret: 'test-jwt-secret',
            expiresIn: '1h',
            refresh: 'test-jwt-refresh',
            expiresInRefresh: '7d',
            resetPass: 'test-jwt-reset-pass',
            expiresInResetPass: '15m',
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
                setAudience: jest.fn().mockReturnThis(),
                setExpirationTime: jest.fn().mockReturnThis(),
                setSubject: jest.fn().mockReturnThis(),
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
        jwtVerify: jest.fn().mockImplementation(async (token: string) => {
            const parts = token.split('.');
            if (parts.length !== 3) throw new Error('Invalid token format');
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            return { payload };
        }),
        errors: {
            JWTExpired: class JWTExpired extends Error {
                constructor(message?: string) { super(message); this.name = 'JWTExpired'; }
            },
        },
    }),
    { virtual: true },
);

const bcryptMock = bcrypt as unknown as {
    compare: jest.Mock;
    hash: jest.Mock;
};

function createRepoMock(): jest.Mocked<IAuthRepository> {
    return {
        createRefreshToken: jest.fn(),
        findRefreshToken: jest.fn(),
        findRefreshTokenByUserAndHash: jest.fn(),
        invalidateRefreshToken: jest.fn(),
        deleteRefreshTokensForUser: jest.fn(),
    };
}

function createUserServiceMock(): jest.Mocked<IUserService> {
    return {
        add: jest.fn(),
        addFirstAdmin: jest.fn(),
        existsByIdAndRole: jest.fn(),
        getById: jest.fn(),
        getByIdentifier: jest.fn(),
        getAll: jest.fn(),
        update: jest.fn(),
        updatePassword: jest.fn(),
        countAdmins: jest.fn(),
    };
}

function buildRefreshToken(sub: number, role: string): string {
    const payload = Buffer.from(
        JSON.stringify({
            sub: sub.toString(),
            role,
            exp: Math.floor(Date.now() / 1000) + 3600,
        }),
    ).toString('base64');

    return `header.${payload}.signature`;
}

function hashToken(token: string): string {
    return createHmac('sha256', 'test-token-secret').update(token).digest('hex');
}

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should login user with valid credentials', async () => {
        const repo = createRepoMock();
        const userService = createUserServiceMock();
        const service = new AuthService(repo, userService);

        userService.getByIdentifier.mockResolvedValue({
            id: 1,
            firstName: 'Johan',
            lastName: 'Gil',
            alias: 'johangil',
            role: 'ADMIN',
            isActive: true,
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
        expect(userService.getByIdentifier).toHaveBeenCalledWith('johangil');
        expect(bcryptMock.compare).toHaveBeenCalledWith('Password123', 'hash');
        expect(repo.deleteRefreshTokensForUser).toHaveBeenCalledWith(1);
        expect(repo.createRefreshToken).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 1,
                tokenHash: expect.any(String),
                expireAt: expect.any(Date),
            }),
        );
    });

    it('should throw InvalidCredentialsError when user is not found', async () => {
        const repo = createRepoMock();
        const userService = createUserServiceMock();
        const service = new AuthService(repo, userService);

        userService.getByIdentifier.mockResolvedValue(null);

        await expect(
            service.login({ identifier: 'missing', password: 'Password123' }),
        ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it('should throw InvalidCredentialsError when password does not match', async () => {
        const repo = createRepoMock();
        const userService = createUserServiceMock();
        const service = new AuthService(repo, userService);

        userService.getByIdentifier.mockResolvedValue({
            id: 1,
            firstName: 'Johan',
            lastName: 'Gil',
            alias: 'johangil',
            role: 'ADMIN',
            isActive: true,
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
        const userService = createUserServiceMock();
        const service = new AuthService(repo, userService);

        userService.add.mockRejectedValue(new ConflictError('conflict'));

        await expect(
            service.register({
                firstName: 'Johan',
                lastName: 'Gil',
                alias: 'johangil',
                email: 'johan@test.com',
                password: 'Password123',
            }),
        ).rejects.toBeInstanceOf(ConflictError);
        expect(userService.add).toHaveBeenCalledWith({
            firstName: 'Johan',
            lastName: 'Gil',
            alias: 'johangil',
            email: 'johan@test.com',
            password: 'Password123',
            role: 'CLIENT',
        });
    });

    it('should register user and generate tokens', async () => {
        const repo = createRepoMock();
        const userService = createUserServiceMock();
        const service = new AuthService(repo, userService);

        userService.add.mockResolvedValue({
            id: 5,
            firstName: 'Johan',
            lastName: 'Gil',
            alias: 'johangil',
            role: 'CLIENT',
        } as any);
        repo.createRefreshToken.mockResolvedValue();

        const result = await service.register({
            firstName: 'Johan',
            lastName: 'Gil',
            alias: 'johangil',
            email: 'johan@test.com',
            phone: '3001234567',
            password: 'Password123',
        });

        expect(userService.add).toHaveBeenCalledWith({
            firstName: 'Johan',
            lastName: 'Gil',
            alias: 'johangil',
            email: 'johan@test.com',
            phone: '3001234567',
            password: 'Password123',
            role: 'CLIENT',
        });
        expect(result).toEqual({
            user: {
                id: 5,
                name: 'Johan Gil',
                alias: 'johangil',
                role: 'CLIENT',
            },
            tokens: {
                accessToken: expect.any(String),
                refreshToken: expect.any(String),
            },
        });
        expect(repo.createRefreshToken).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 5,
                tokenHash: expect.any(String),
                expireAt: expect.any(Date),
            }),
        );
    });

    it('should rotate refresh token on refresh', async () => {
        const repo = createRepoMock();
        const userService = createUserServiceMock();
        const service = new AuthService(repo, userService);

        const refreshToken = buildRefreshToken(1, 'ADMIN');
        const refreshTokenHash = hashToken(refreshToken);

        repo.findRefreshToken.mockResolvedValue({
            userId: 1,
            tokenHash: refreshTokenHash,
        } as any);
        repo.invalidateRefreshToken.mockResolvedValue();
        repo.createRefreshToken.mockResolvedValue();
        userService.getById.mockResolvedValue({
            id: 1,
            firstName: 'Johan',
            lastName: 'Gil',
            alias: 'johangil',
            role: 'ADMIN',
            isActive: true,
        } as any);

        const result = await service.refresh({ refreshToken });

        expect(repo.findRefreshToken).toHaveBeenCalledWith(refreshTokenHash);
        expect(repo.invalidateRefreshToken).toHaveBeenCalledWith(
            refreshTokenHash,
        );
        expect(repo.createRefreshToken).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 1,
                tokenHash: expect.any(String),
                expireAt: expect.any(Date),
            }),
        );
        expect(result.user).toEqual({
            id: 1,
            name: 'Johan Gil',
            alias: 'johangil',
            role: 'ADMIN',
        });
        expect(result.tokens.accessToken).toEqual(expect.any(String));
        expect(result.tokens.refreshToken).toEqual(expect.any(String));
    });

    it('should throw TokenReuseError when refresh token is not stored', async () => {
        const repo = createRepoMock();
        const userService = createUserServiceMock();
        const service = new AuthService(repo, userService);

        const refreshToken = buildRefreshToken(1, 'ADMIN');
        const refreshTokenHash = hashToken(refreshToken);

        repo.findRefreshToken.mockResolvedValue(null);

        await expect(service.refresh({ refreshToken })).rejects.toBeInstanceOf(
            TokenReuseError,
        );
        expect(repo.deleteRefreshTokensForUser).toHaveBeenCalledWith(1);
        expect(repo.findRefreshToken).toHaveBeenCalledWith(refreshTokenHash);
        expect(repo.invalidateRefreshToken).not.toHaveBeenCalled();
    });

    it('should logout and invalidate stored refresh token', async () => {
        const repo = createRepoMock();
        const userService = createUserServiceMock();
        const service = new AuthService(repo, userService);

        const refreshToken = buildRefreshToken(1, 'ADMIN');
        const refreshTokenHash = hashToken(refreshToken);

        repo.findRefreshToken.mockResolvedValue({
            userId: 1,
            tokenHash: refreshTokenHash,
        } as any);
        repo.invalidateRefreshToken.mockResolvedValue();

        await service.logout({ refreshToken, userId: 1 });

        expect(repo.findRefreshToken).toHaveBeenCalledWith(refreshTokenHash);
        expect(repo.invalidateRefreshToken).toHaveBeenCalledWith(
            refreshTokenHash,
        );
    });

    it('should return true when an admin exists', async () => {
        const repo = createRepoMock();
        const userService = createUserServiceMock();
        const service = new AuthService(repo, userService);

        userService.countAdmins.mockResolvedValue(2);

        await expect(service.checkAdminExists()).resolves.toBe(true);
        expect(userService.countAdmins).toHaveBeenCalled();
    });
});

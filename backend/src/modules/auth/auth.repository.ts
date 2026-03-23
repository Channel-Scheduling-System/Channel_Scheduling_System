import prisma from '#/config/prisma.js';
import type { User, RecoveryCode, RefreshToken } from '@prisma/client.js';
import { CreateUserData } from './auth.types.js';

export interface IAuthRepository {
    // User-related methods
    findUserByIdentifier(identifier: string): Promise<User | null>;
    findUserByEmail(email: string): Promise<User | null>;
    findUserById(id: number): Promise<User | null>;
    createUser(data: CreateUserData): Promise<User>;
    updatePassword(userId: number, passwordHash: string): Promise<void>;
    // Token-related methods
    createRefreshToken(
        userId: number,
        token: string,
        expireAt: Date,
    ): Promise<void>;
    findRefreshToken(tokenHash: string): Promise<RefreshToken | null>;
    findRefreshTokenByUserAndHash(
        userId: number,
        tokenHash: string,
    ): Promise<RefreshToken | null>;
    invalidateRefreshToken(token: string): Promise<void>;
    deleteRefreshTokensForUser(userId: number): Promise<void>;
    // Recovery code-related methods
    createRecoveryCode(
        userId: number,
        code: string,
        expireAt: Date,
    ): Promise<RecoveryCode>;
    findValidRecoveryCode(userId: number, code: string): Promise<boolean>;
    markRecoveryCodeAsUsed(id: number): Promise<void>;
    invalidateRecoveryCodes(userId: number): Promise<void>;
}

export class AuthRepository implements IAuthRepository {
    async findUserByIdentifier(identifier: string): Promise<User | null> {
        return await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { alias: identifier },
                    { phone: identifier },
                ],
            },
        });
    }

    async findUserByEmail(email: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { email },
        });
    }

    async findUserById(id: number): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { id },
        });
    }

    async createUser(data: CreateUserData): Promise<User> {
        return await prisma.user.create({
            data: {
                ...data,
            },
        });
    }

    async updatePassword(userId: number, passwordHash: string): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash,
                mustChangePwd: false,
            },
        });
    }

    async createRefreshToken(
        userId: number,
        tokenHash: string,
        expireAt: Date,
    ): Promise<void> {
        await prisma.refreshToken.create({
            data: {
                userId,
                tokenHash,
                expireAt,
            },
        });
    }

    async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
        return await prisma.refreshToken.findFirst({
            where: {
                tokenHash,
                revoked: false,
                expireAt: {
                    gte: new Date(),
                },
            },
        });
    }

    async findRefreshTokenByUserAndHash(
        userId: number,
        tokenHash: string,
    ): Promise<RefreshToken | null> {
        return await prisma.refreshToken.findFirst({
            where: {
                userId,
                tokenHash,
                revoked: false,
                expireAt: {
                    gte: new Date(),
                },
            },
        });
    }

    async invalidateRefreshToken(tokenHash: string): Promise<void> {
        await prisma.refreshToken.updateMany({
            where: {
                tokenHash,
            },
            data: {
                revoked: true,
            },
        });
    }

    async deleteRefreshTokensForUser(userId: number): Promise<void> {
        await prisma.refreshToken.updateMany({
            where: {
                userId,
                revoked: false,
            },
            data: {
                revoked: true,
            },
        });
    }

    async createRecoveryCode(
        userId: number,
        code: string,
        expireAt: Date,
    ): Promise<RecoveryCode> {
        return await prisma.recoveryCode.create({
            data: {
                userId,
                code,
                expireAt,
            },
        });
    }

    async findValidRecoveryCode(
        userId: number,
        code: string,
    ): Promise<boolean> {
        return !!(await prisma.recoveryCode.findFirst({
            where: {
                userId,
                code,
                used: false,
                expireAt: {
                    gte: new Date(),
                },
            },
        }));
    }

    async markRecoveryCodeAsUsed(id: number): Promise<void> {
        await prisma.recoveryCode.update({
            where: { id },
            data: {
                used: true,
            },
        });
    }

    async invalidateRecoveryCodes(userId: number): Promise<void> {
        await prisma.recoveryCode.updateMany({
            where: {
                userId,
                used: false,
            },
            data: {
                used: true,
            },
        });
    }
}

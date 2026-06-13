import prisma from '../../config/prisma.js';
import type { RefreshToken } from '@prisma/client.js';
import { CreateRefreshTokenData } from './auth.types.js';

export interface IAuthRepository {
    createRefreshToken(data: CreateRefreshTokenData): Promise<void>;
    findRefreshToken(tokenHash: string): Promise<RefreshToken | null>;
    invalidateRefreshToken(tokenHash: string): Promise<void>;
    deleteRefreshTokensForUser(userId: number): Promise<void>;
}

export class AuthRepository implements IAuthRepository {
    async createRefreshToken(data: CreateRefreshTokenData): Promise<void> {
        await prisma.refreshToken.create({ data });
    }

    async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
        return await prisma.refreshToken.findUnique({
            where: {
                tokenHash,
                revoked: false,
                expireAt: { gte: new Date() },
            },
        });
    }

    async invalidateRefreshToken(tokenHash: string): Promise<void> {
        await prisma.refreshToken.update({
            where: { tokenHash },
            data: { revoked: true },
        });
    }

    async deleteRefreshTokensForUser(userId: number): Promise<void> {
        await prisma.refreshToken.updateMany({
            where: {
                userId,
                revoked: false,
            },
            data: { revoked: true },
        });
    }
}

import prisma from '#/config/prisma.js';
import type { User, RecoveryCode } from '@prisma/client.js';
import { CreateUserData } from './auth.types.js';

export interface IAuthRepository {
    // User-related methods
    findUserByIdentifier(identifier: string): Promise<User | null>;
    findUserByEmail(email: string): Promise<User | null>;
    findUserById(id: number): Promise<User | null>;
    createUser(data: CreateUserData): Promise<User>;
    updatePassword(userId: number, passwordHash: string): Promise<void>;
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

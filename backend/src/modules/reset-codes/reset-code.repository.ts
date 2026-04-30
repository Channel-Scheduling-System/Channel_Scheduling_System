import prisma from '../../config/prisma.js';
import { ResetCode } from '@prisma/client.js';
import { CreateResetCodeData } from './reset-code.types.js';

export interface IResetCodeRepository {
    create(data: CreateResetCodeData): Promise<ResetCode>;
    invalidatePreviousCodes(userId: number): Promise<void>;
    findByUserId(userId: number): Promise<ResetCode | null>;
    incrementAttempts(id: number): Promise<void>;
    markAsUsed(id: number): Promise<void>;
}

export class ResetCodeRepository implements IResetCodeRepository {
    async create(data: CreateResetCodeData): Promise<ResetCode> {
        return await prisma.resetCode.create({ data });
    }

    async invalidatePreviousCodes(userId: number): Promise<void> {
        await prisma.resetCode.updateMany({
            where: {
                userId,
                used: false,
            },
            data: {
                used: true,
            },
        });
    }

    async findByUserId(userId: number): Promise<ResetCode | null> {
        return await prisma.resetCode.findFirst({
            where: {
                userId,
                used: false,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async incrementAttempts(id: number): Promise<void> {
        await prisma.resetCode.updateMany({
            where: { id, used: false },
            data: { attempts: { increment: 1 } },
        });
    }

    async markAsUsed(id: number): Promise<void> {
        await prisma.resetCode.update({
            where: { id },
            data: { used: true },
        });
    }
}

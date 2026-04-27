import prisma from '../../config/prisma.js';
import { ResetCode } from '@prisma/client.js';
import { CreateResetCodeData } from './reset-code.types.js';

export interface IResetCodeRepository {
    create(data: CreateResetCodeData): Promise<ResetCode>;
    invalidate(userId: number): Promise<void>;
}

export class ResetCodeRepository implements IResetCodeRepository {
    async create(data: CreateResetCodeData): Promise<ResetCode> {
        return await prisma.resetCode.create({ data });
    }

    async invalidate(userId: number): Promise<void> {
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
}

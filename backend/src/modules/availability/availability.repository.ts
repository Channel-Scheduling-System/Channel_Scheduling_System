import prisma from '../../config/prisma.js';
import { BlockedTime } from '@prisma/client.js';
import {
    CreateBlockedTimeData,
    CreateWorkingHourData,
} from './availability.types.js';

export interface IAvailabilityRepository {
    createWorkingHourBulk(data: CreateWorkingHourData[]): Promise<void>;
    deleteWorkingHoursByWorkerId(workerId: number): Promise<void>;
    createBlockedTime(data: CreateBlockedTimeData): Promise<void>;
    findBlockedTimeById(id: number): Promise<BlockedTime | null>;
    findAllBlockedTimesByWorkerId(workerId: number): Promise<BlockedTime[]>;
    deleteBlockedTime(id: number): Promise<void>;
}

export class AvailabilityRepository implements IAvailabilityRepository {
    async createWorkingHourBulk(data: CreateWorkingHourData[]): Promise<void> {
        await prisma.workingHour.createMany({ data });
    }

    async deleteWorkingHoursByWorkerId(workerId: number): Promise<void> {
        await prisma.workingHour.deleteMany({ where: { workerId } });
    }

    async createBlockedTime(data: CreateBlockedTimeData): Promise<void> {
        await prisma.blockedTime.create({ data });
    }

    async findBlockedTimeById(id: number): Promise<BlockedTime | null> {
        return await prisma.blockedTime.findUnique({
            where: { id },
        });
    }

    async findAllBlockedTimesByWorkerId(
        workerId: number,
    ): Promise<BlockedTime[]> {
        return await prisma.blockedTime.findMany({
            where: { workerId },
            orderBy: { startDate: 'asc' },
        });
    }

    async deleteBlockedTime(id: number): Promise<void> {
        await prisma.blockedTime.delete({ where: { id } });
    }
}

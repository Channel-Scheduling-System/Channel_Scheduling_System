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
    findAllBlockedTimesByWorkerId(workerId: number): Promise<BlockedTime[]>;
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

    async findAllBlockedTimesByWorkerId(
        workerId: number,
    ): Promise<BlockedTime[]> {
        return await prisma.blockedTime.findMany({
            where: { workerId },
            orderBy: { startDate: 'asc' },
        });
    }
}

import prisma from '../../config/prisma.js';
import { BlockedTime, Prisma, WorkingHour } from '@prisma/client.js';
import {
    BlockedTimeFilter,
    CreateBlockedTimeData,
    CreateWorkingHourData,
    HourBlockedTimeFilter,
    WorkingHourFilter,
} from './availability.types.js';

export interface IAvailabilityRepository {
    createWorkingHourBulk(data: CreateWorkingHourData[]): Promise<void>;
    createBlockedTime(data: CreateBlockedTimeData): Promise<void>;
    deleteWorkingHoursByWorkerId(workerId: number): Promise<void>;
    deleteBlockedTime(id: number): Promise<void>;
    findBlockedTimeById(id: number): Promise<BlockedTime | null>;
    findWorkingHours(filter: WorkingHourFilter): Promise<WorkingHour[]>;
    findBlockedTimes(filter: BlockedTimeFilter): Promise<BlockedTime[]>;
    findHourBlockedTimes(filter: HourBlockedTimeFilter): Promise<BlockedTime[]>;
}

export class AvailabilityRepository implements IAvailabilityRepository {
    async createWorkingHourBulk(data: CreateWorkingHourData[]): Promise<void> {
        await prisma.workingHour.createMany({ data });
    }

    async createBlockedTime(data: CreateBlockedTimeData): Promise<void> {
        await prisma.blockedTime.create({ data });
    }

    async deleteWorkingHoursByWorkerId(workerId: number): Promise<void> {
        await prisma.workingHour.deleteMany({ where: { workerId } });
    }

    async deleteBlockedTime(id: number): Promise<void> {
        await prisma.blockedTime.delete({ where: { id } });
    }

    async findBlockedTimeById(id: number): Promise<BlockedTime | null> {
        return await prisma.blockedTime.findUnique({
            where: { id },
        });
    }

    async findWorkingHours(filter: WorkingHourFilter): Promise<WorkingHour[]> {
        return await prisma.workingHour.findMany({
            where: { ...filter },
            orderBy: { dayOfWeek: 'asc' },
        });
    }

    async findBlockedTimes(filter: BlockedTimeFilter): Promise<BlockedTime[]> {
        const where = this.buildBlockedTimeWhere(filter);
        return await prisma.blockedTime.findMany({
            where,
            orderBy: { startDate: 'asc' },
        });
    }

    async findHourBlockedTimes(
        filter: HourBlockedTimeFilter,
    ): Promise<BlockedTime[]> {
        const where = this.buildHourBlockedTimeWhere(filter);
        return await prisma.blockedTime.findMany({
            where,
            orderBy: { startDate: 'asc' },
        });
    }

    // ============================================================
    // * WHERE CLAUSE BUILDERS
    // ============================================================

    private buildBlockedTimeWhere(
        filter: BlockedTimeFilter,
    ): Prisma.BlockedTimeWhereInput {
        const where: Prisma.BlockedTimeWhereInput = {
            workerId: filter.workerId,
        };
        if (filter.type) where.type = filter.type;
        if (filter.startDate || filter.endDate) {
            where.AND = [];
            if (filter.startDate) {
                if (filter.type === 'PERIOD')
                    where.AND.push({
                        endDate: { gte: new Date(filter.startDate) },
                    });
                else
                    where.AND.push({
                        startDate: { gte: new Date(filter.startDate) },
                    });
            }
            if (filter.endDate) {
                where.AND.push({
                    startDate: { lte: new Date(filter.endDate) },
                });
            }
        }
        return where;
    }

    private buildHourBlockedTimeWhere(
        filter: HourBlockedTimeFilter,
    ): Prisma.BlockedTimeWhereInput {
        const where: Prisma.BlockedTimeWhereInput = {
            workerId: filter.workerId,
            type: 'HOUR',
        };
        if (filter.type === 'RECURRING') where.dayOfWeek = { not: null };
        else if (filter.type === 'SPECIFIC') where.dayOfWeek = null;
        if (filter.dayOfWeek !== undefined) where.dayOfWeek = filter.dayOfWeek;
        if (filter.startDate || filter.endDate) {
            where.AND = [];
            if (filter.startDate) {
                where.AND.push({
                    startDate: { gte: new Date(filter.startDate) },
                });
            }
            if (filter.endDate) {
                where.AND.push({
                    startDate: { lte: new Date(filter.endDate) },
                });
            }
        }
        return where;
    }
}

import prisma from '../../config/prisma.js';
import { BlockedTime, WorkingHour } from '@prisma/client.js';
import {
    BlockedTimeFilter,
    BlockedTimeByDateFilter,
    CreateBlockedTimeData,
    CreateWorkingHourData,
    WorkingHourFilter,
} from './availability.types.js';

export interface IAvailabilityRepository {
    createWorkingHourBulk(data: CreateWorkingHourData[]): Promise<void>;
    createBlockedTime(data: CreateBlockedTimeData): Promise<void>;
    deleteWorkingHoursByWorkerId(workerId: number): Promise<void>;
    deleteBlockedTime(id: number): Promise<void>;
    findWorkingHours(filter: WorkingHourFilter): Promise<WorkingHour[]>;
    findBlockedTimeById(id: number): Promise<BlockedTime | null>;
    findBlockedTimesByWorkerId(workerId: number): Promise<BlockedTime[]>;
    findRecurringTimeOffs(filter: BlockedTimeFilter): Promise<BlockedTime[]>;
    findSpecificTimeOffs(filter: BlockedTimeFilter): Promise<BlockedTime[]>;
    findDayOffs(filter: BlockedTimeFilter): Promise<BlockedTime[]>;
    findPeriodOffs(filter: BlockedTimeFilter): Promise<BlockedTime[]>;
    findBlockedTimesByDate(
        filter: BlockedTimeByDateFilter,
    ): Promise<BlockedTime[]>;
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

    async findWorkingHours(filter: WorkingHourFilter): Promise<WorkingHour[]> {
        return await prisma.workingHour.findMany({
            where: { ...filter },
            orderBy: { dayOfWeek: 'asc' },
        });
    }

    async findBlockedTimeById(id: number): Promise<BlockedTime | null> {
        return await prisma.blockedTime.findUnique({
            where: { id },
        });
    }

    async findBlockedTimesByWorkerId(workerId: number): Promise<BlockedTime[]> {
        return await prisma.blockedTime.findMany({
            where: { workerId },
            orderBy: { startDate: 'asc' },
        });
    }

    async findRecurringTimeOffs(
        filter: BlockedTimeFilter,
    ): Promise<BlockedTime[]> {
        return await prisma.blockedTime.findMany({
            where: {
                workerId: filter.workerId,
                type: 'HOUR',
                dayOfWeek: filter.dayOfWeek ? filter.dayOfWeek : { not: null },
            },
            orderBy: { startDate: 'asc' },
        });
    }

    async findSpecificTimeOffs(
        filter: BlockedTimeFilter,
    ): Promise<BlockedTime[]> {
        return await prisma.blockedTime.findMany({
            where: {
                workerId: filter.workerId,
                type: 'HOUR',
                dayOfWeek: null,
                AND: [
                    {
                        startDate: filter.startDate
                            ? { gte: new Date(filter.startDate) }
                            : undefined,
                    },
                    {
                        startDate: filter.endDate
                            ? { lte: new Date(filter.endDate) }
                            : undefined,
                    },
                ],
            },
            orderBy: { startDate: 'asc' },
        });
    }

    async findDayOffs(filter: BlockedTimeFilter): Promise<BlockedTime[]> {
        return await prisma.blockedTime.findMany({
            where: {
                workerId: filter.workerId,
                type: 'DAY',
                AND: [
                    {
                        startDate: filter.startDate
                            ? { gte: new Date(filter.startDate) }
                            : undefined,
                    },
                    {
                        startDate: filter.endDate
                            ? { lte: new Date(filter.endDate) }
                            : undefined,
                    },
                ],
            },
            orderBy: { startDate: 'asc' },
        });
    }

    async findPeriodOffs(filter: BlockedTimeFilter): Promise<BlockedTime[]> {
        return await prisma.blockedTime.findMany({
            where: {
                workerId: filter.workerId,
                type: 'PERIOD',
                AND: [
                    {
                        startDate: filter.endDate
                            ? { lte: new Date(filter.endDate) }
                            : undefined,
                    },
                    {
                        endDate: filter.startDate
                            ? { gte: new Date(filter.startDate) }
                            : undefined,
                    },
                ],
            },
            orderBy: { startDate: 'asc' },
        });
    }

    async findBlockedTimesByDate(
        filter: BlockedTimeByDateFilter,
    ): Promise<BlockedTime[]> {
        const dateObj = new Date(filter.date);
        return await prisma.blockedTime.findMany({
            where: {
                workerId: filter.workerId,
                OR: [
                    {
                        type: 'DAY',
                        startDate: dateObj,
                    },
                    {
                        type: 'PERIOD',
                        AND: [
                            { startDate: { lte: dateObj } },
                            { endDate: { gte: dateObj } },
                        ],
                    },
                    {
                        type: 'HOUR',
                        dayOfWeek: null,
                        startDate: dateObj,
                    },
                    {
                        type: 'HOUR',
                        dayOfWeek: filter.dayOfWeek,
                    },
                ],
            },
            orderBy: { startDate: 'asc' },
        });
    }
}

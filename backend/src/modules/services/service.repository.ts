import prisma from '#/config/prisma.js';
import type { Service } from '@prisma/client.js';
import {
    CreateServiceData,
} from './service.types.js';

export interface IServiceRepository {
    create(data: CreateServiceData): Promise<Service>;
    existsByName(workerId: number, name: string): Promise<boolean>;
}

export class ServiceRepository implements IServiceRepository {
    async create(data: CreateServiceData): Promise<Service> {
        return await prisma.service.create({ data });
    }

    async existsByName(workerId: number, name: string): Promise<boolean> {
        const exists = await prisma.service.findUnique({
            where: { workerId_name: { workerId, name } },
            select: { id: true },
        });
        return !!exists;
    }

}

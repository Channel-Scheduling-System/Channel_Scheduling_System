import prisma from '../../config/prisma.js';
import type { Service } from '@prisma/client.js';
import {
    CreateServiceData,
    ServiceFilters,
    UpdateServiceData,
} from './service.types.js';

export interface IServiceRepository {
    create(data: CreateServiceData): Promise<Service>;
    existsById(id: number): Promise<boolean>;
    existsByName(workerId: number, name: string): Promise<boolean>;
    findById(id: number): Promise<Service | null>;
    findAll(filters: ServiceFilters): Promise<Service[]>;
    update(id: number, data: UpdateServiceData): Promise<Service>;
    delete(id: number): Promise<Service>;
}

export class ServiceRepository implements IServiceRepository {
    async create(data: CreateServiceData): Promise<Service> {
        return await prisma.service.create({ data });
    }

    async existsById(id: number): Promise<boolean> {
        const exists = await prisma.service.findUnique({
            where: { id },
            select: { id: true },
        });
        return !!exists;
    }

    async existsByName(workerId: number, name: string): Promise<boolean> {
        const exists = await prisma.service.findUnique({
            where: { workerId_name: { workerId, name } },
            select: { id: true },
        });
        return !!exists;
    }

    async findById(id: number): Promise<Service | null> {
        return await prisma.service.findUnique({
            where: { id },
        });
    }

    async findAll(filters: ServiceFilters): Promise<Service[]> {
        return await prisma.service.findMany({
            where: { ...filters },
            orderBy: { createdAt: 'desc' },
        });
    }

    async update(id: number, data: UpdateServiceData): Promise<Service> {
        return await prisma.service.update({
            where: { id },
            data,
        });
    }

    async delete(id: number): Promise<Service> {
        return await prisma.service.delete({
            where: { id },
        });
    }
}

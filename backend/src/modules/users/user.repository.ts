import prisma from '../../config/prisma.js';
import { Prisma, SystemRole, User } from '@prisma/client.js';
import {
    CreateUserData,
    UpdateUserData,
    UserFilters,
    UserPagination,
} from './user.types.js';

export interface IUserRepository {
    create(data: CreateUserData): Promise<User>;
    existsById(id: number): Promise<boolean>;
    existsByEmail(email: string): Promise<boolean>;
    existsByAlias(alias: string): Promise<boolean>;
    existsByPhone(phone: string): Promise<boolean>;
    existsByIdAndRole(id: number, role: SystemRole): Promise<boolean>;
    findById(id: number): Promise<User | null>;
    findByIdentifier(identifier: string): Promise<User | null>;
    findAll(
        pagination: UserPagination,
        filters: UserFilters,
    ): Promise<{ data: User[]; total: number }>;
    update(userId: number, data: UpdateUserData): Promise<User>;
    updatePassword(userId: number, passwordHash: string): Promise<void>;
    updateIsActive(id: number, isActive: boolean): Promise<void>;
    countAdmins(): Promise<number>;
}

export class UserRepository implements IUserRepository {
    async create(data: CreateUserData): Promise<User> {
        return await prisma.user.create({
            data: {
                ...data,
            },
        });
    }

    async existsById(id: number): Promise<boolean> {
        const exists = await prisma.user.findUnique({
            where: { id, isActive: true },
            select: { id: true },
        });
        return !!exists;
    }

    async existsByEmail(email: string): Promise<boolean> {
        const exists = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });
        return !!exists;
    }

    async existsByAlias(alias: string): Promise<boolean> {
        const exists = await prisma.user.findUnique({
            where: { alias },
            select: { id: true },
        });
        return !!exists;
    }

    async existsByPhone(phone: string): Promise<boolean> {
        const exists = await prisma.user.findUnique({
            where: { phone },
            select: { id: true },
        });
        return !!exists;
    }

    async existsByIdAndRole(id: number, role: SystemRole): Promise<boolean> {
        const exists = await prisma.user.findFirst({
            where: { id, role, isActive: true },
            select: { id: true },
        });
        return !!exists;
    }

    async findById(id: number): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { id },
        });
    }

    async findByIdentifier(identifier: string): Promise<User | null> {
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

    async findAll(
        pagination: UserPagination,
        filters: UserFilters,
    ): Promise<{ data: User[]; total: number }> {
        const limit = pagination.limit || 10;
        const page = Math.max(1, pagination.page || 1);
        const skip = (page - 1) * limit;

        const where = this.buildWhere(filters);
        const [data, total] = await Promise.all([
            prisma.user.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);

        return { data, total };
    }

    private buildWhere(filters: UserFilters): Prisma.UserWhereInput {
        const where: Prisma.UserWhereInput = {};

        if (filters.role) where.role = { in: filters.role };
        if (filters.isActive !== undefined) where.isActive = filters.isActive;
        if (filters.identifier) {
            where.OR = [
                { email: { contains: filters.identifier } },
                { alias: { contains: filters.identifier } },
                { phone: { contains: filters.identifier } },
            ];
        }

        return where;
    }

    async update(id: number, data: UpdateUserData): Promise<User> {
        return await prisma.user.update({
            where: { id },
            data,
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

    async updateIsActive(id: number, isActive: boolean): Promise<void> {
        await prisma.user.update({
            where: { id },
            data: { isActive },
        });
    }

    async countAdmins(): Promise<number> {
        return await prisma.user.count({
            where: {
                role: 'ADMIN',
            },
        });
    }
}

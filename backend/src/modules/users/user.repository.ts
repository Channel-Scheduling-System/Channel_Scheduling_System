import prisma from '../../config/prisma.js';
import { SystemRole, User } from '@prisma/client.js';
import { CreateUserData } from './user.types.js';

export interface IUserRepository {
    create(data: CreateUserData): Promise<User>;
    existsById(id: number): Promise<boolean>;
    existsByEmail(email: string): Promise<boolean>;
    existsByAlias(alias: string): Promise<boolean>;
    existsByPhone(phone: string): Promise<boolean>;
    existsByIdAndRole(id: number, role: SystemRole): Promise<boolean>;
    findById(id: number): Promise<User | null>;
    findByIdentifier(identifier: string): Promise<User | null>;
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
            where: { id },
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
            where: { id, role },
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

    async countAdmins(): Promise<number> {
        return await prisma.user.count({
            where: {
                role: 'ADMIN',
            },
        });
    }
}

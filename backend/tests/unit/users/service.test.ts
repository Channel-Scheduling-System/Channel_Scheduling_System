/// <reference types="jest" />

import bcrypt from 'bcrypt';

jest.mock('../../../src/config/env', () => ({
    env: {
        firstAdminSecretCode: '1234567890',
    },
}));

jest.mock('bcrypt', () => ({
    __esModule: true,
    default: {
        compare: jest.fn(),
        hash: jest.fn(),
    },
}));

import { UserService } from '../../../src/modules/users/user.service';
import type { IUserRepository } from '../../../src/modules/users/user.repository';
import { ConflictError, NotFoundError } from '../../../src/shared/errors/domain.error';
import { InvalidCredentialsError } from '../../../src/shared/errors/validation.error';

const bcryptMock = bcrypt as unknown as {
    compare: jest.Mock;
    hash: jest.Mock;
};

type UserEntity = {
    id: number;
    alias: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    email: string;
    passwordHash: string;
    role: 'ADMIN' | 'CLIENT' | 'WORKER';
    mustChangePwd: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

function createRepoMock(): jest.Mocked<IUserRepository> {
    return {
        create: jest.fn(),
        existsById: jest.fn(),
        existsByEmail: jest.fn(),
        existsByAlias: jest.fn(),
        existsByPhone: jest.fn(),
        existsByIdAndRole: jest.fn(),
        findById: jest.fn(),
        findByIdentifier: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
        updatePassword: jest.fn(),
        countAdmins: jest.fn(),
    };
}

function createUserEntity(overrides: Partial<UserEntity> = {}): UserEntity {
    return {
        id: 1,
        alias: 'johangil',
        firstName: 'Johan',
        lastName: 'Gil',
        phone: '3001234567',
        email: 'johan@test.com',
        passwordHash: 'hash',
        role: 'CLIENT' as const,
        mustChangePwd: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should register a user with hashed password', async () => {
        const repo = createRepoMock();
        const service = new UserService(repo);

        const input = {
            alias: 'johangil',
            firstName: 'Johan',
            lastName: 'Gil',
            phone: '3001234567',
            email: 'johan@test.com',
            password: 'Password123!',
            role: 'CLIENT' as const,
        };

        const createdUser = createUserEntity({ role: 'CLIENT' });

        repo.existsByAlias.mockResolvedValue(false);
        repo.existsByEmail.mockResolvedValue(false);
        repo.existsByPhone.mockResolvedValue(false);
        bcryptMock.hash.mockResolvedValue('hashed-password');
        repo.create.mockResolvedValue(createdUser as any);

        const result = await service.add(input, 'ADMIN');

        expect(result).toEqual({
            id: 1,
            alias: 'johangil',
            firstName: 'Johan',
            lastName: 'Gil',
            phone: '3001234567',
            email: 'johan@test.com',
            role: 'CLIENT',
            isActive: true,
        });
        expect(repo.create).toHaveBeenCalledWith({
            alias: 'johangil',
            firstName: 'Johan',
            lastName: 'Gil',
            phone: '3001234567',
            email: 'johan@test.com',
            role: 'CLIENT',
            passwordHash: 'hashed-password',
        });
    });

    it('should register the first admin when no admins exist', async () => {
        const repo = createRepoMock();
        const service = new UserService(repo);

        const input = {
            alias: 'adminone',
            firstName: 'Admin',
            lastName: 'One',
            phone: '3000000001',
            email: 'admin@test.com',
            password: 'Password123!',
            secretCode: '1234567890',
        };

        const createdUser = createUserEntity({
            alias: 'adminone',
            firstName: 'Admin',
            lastName: 'One',
            phone: '3000000001',
            email: 'admin@test.com',
            role: 'ADMIN',
        });

        repo.countAdmins.mockResolvedValue(0);
        repo.existsByAlias.mockResolvedValue(false);
        repo.existsByEmail.mockResolvedValue(false);
        repo.existsByPhone.mockResolvedValue(false);
        bcryptMock.hash.mockResolvedValue('hashed-admin-password');
        repo.create.mockResolvedValue(createdUser as any);

        const result = await service.addFirstAdmin(input);

        expect(repo.countAdmins).toHaveBeenCalled();
        expect(repo.create).toHaveBeenCalledWith({
            alias: 'adminone',
            firstName: 'Admin',
            lastName: 'One',
            phone: '3000000001',
            email: 'admin@test.com',
            role: 'ADMIN',
            passwordHash: 'hashed-admin-password',
        });
        expect(result).toEqual({
            id: 1,
            alias: 'adminone',
            firstName: 'Admin',
            lastName: 'One',
            phone: '3000000001',
            email: 'admin@test.com',
            role: 'ADMIN',
            isActive: true,
        });
    });

    it('should throw ConflictError when first admin already exists', async () => {
        const repo = createRepoMock();
        const service = new UserService(repo);

        repo.countAdmins.mockResolvedValue(1);

        await expect(
            service.addFirstAdmin({
                alias: 'adminone',
                firstName: 'Admin',
                lastName: 'One',
                phone: '3000000001',
                email: 'admin@test.com',
                password: 'Password123!',
                secretCode: '1234567890',
            }),
        ).rejects.toBeInstanceOf(ConflictError);
    });

    it('should return a user by id with auth permissions', async () => {
        const repo = createRepoMock();
        const service = new UserService(repo);

        repo.findById.mockResolvedValue(
            createUserEntity({
                id: 1,
                role: 'WORKER',
                alias: 'workerone',
                email: 'worker@test.com',
            }) as any,
        );

        const result = await service.getById(1, { id: 99, role: 'ADMIN' });

        expect(result).toEqual({
            id: 1,
            alias: 'workerone',
            firstName: 'Johan',
            lastName: 'Gil',
            phone: '3001234567',
            email: 'worker@test.com',
            role: 'WORKER',
            isActive: true,
        });
        expect(repo.findById).toHaveBeenCalledWith(1);
    });

    it('should return paginated users filtered by role visibility', async () => {
        const repo = createRepoMock();
        const service = new UserService(repo);

        repo.findAll.mockResolvedValue({
            data: [
                createUserEntity({
                    id: 1,
                    role: 'WORKER',
                    alias: 'workerone',
                }) as any,
                createUserEntity({
                    id: 2,
                    role: 'CLIENT',
                    alias: 'clientone',
                }) as any,
            ],
            total: 2,
        });

        const result = await service.getAll(
            { page: 2, limit: 5 },
            { identifier: 'jo' },
            'ADMIN',
        );

        expect(repo.findAll).toHaveBeenCalledWith(
            { page: 2, limit: 5 },
            { identifier: 'jo', role: ['WORKER', 'CLIENT'] },
        );
        expect(result.meta).toEqual({
            total: 2,
            page: 2,
            limit: 5,
            totalPages: 1,
        });
        expect(result.data).toHaveLength(2);
    });

    it('should update another user when auth role allows it', async () => {
        const repo = createRepoMock();
        const service = new UserService(repo);

        const currentUser = createUserEntity({
            id: 1,
            role: 'WORKER',
            alias: 'workerone',
            email: 'worker@test.com',
        });

        const updatedUser = createUserEntity({
            id: 1,
            role: 'WORKER',
            alias: 'workerone',
            firstName: 'Carlos',
            email: 'worker@test.com',
        });

        repo.findById.mockResolvedValue(currentUser as any);
        repo.update.mockResolvedValue(updatedUser as any);

        const result = await service.update(
            {
                id: 1,
                firstName: 'Carlos',
            },
            { id: 99, role: 'ADMIN' },
        );

        expect(repo.update).toHaveBeenCalledWith(1, {
            id: 1,
            firstName: 'Carlos',
        });
        expect(result).toEqual({
            id: 1,
            alias: 'workerone',
            firstName: 'Carlos',
            lastName: 'Gil',
            phone: '3001234567',
            email: 'worker@test.com',
            role: 'WORKER',
            isActive: true,
        });
    });

    it('should update password when the current password matches', async () => {
        const repo = createRepoMock();
        const service = new UserService(repo);

        repo.findById.mockResolvedValue(
            createUserEntity({
                id: 1,
                role: 'CLIENT',
                passwordHash: 'old-hash',
            }) as any,
        );
        bcryptMock.compare.mockResolvedValue(true);
        bcryptMock.hash.mockResolvedValue('new-hash');
        repo.updatePassword.mockResolvedValue();

        await service.updatePassword(
            {
                id: 1,
                password: 'OldPass123!',
                newPassword: 'NewPass123!',
            },
            { id: 1, role: 'CLIENT' },
        );

        expect(bcryptMock.compare).toHaveBeenCalledWith('OldPass123!', 'old-hash');
        expect(bcryptMock.hash).toHaveBeenCalledWith('NewPass123!', 10);
        expect(repo.updatePassword).toHaveBeenCalledWith(1, 'new-hash');
    });

    it('should throw InvalidCredentialsError when the current password is wrong', async () => {
        const repo = createRepoMock();
        const service = new UserService(repo);

        repo.findById.mockResolvedValue(
            createUserEntity({
                id: 1,
                role: 'CLIENT',
                passwordHash: 'old-hash',
            }) as any,
        );
        bcryptMock.compare.mockResolvedValue(false);

        await expect(
            service.updatePassword(
                {
                    id: 1,
                    password: 'WrongPass123!',
                    newPassword: 'NewPass123!',
                },
                { id: 1, role: 'CLIENT' },
            ),
        ).rejects.toBeInstanceOf(InvalidCredentialsError);
        expect(repo.updatePassword).not.toHaveBeenCalled();
    });

    it('should count admins', async () => {
        const repo = createRepoMock();
        const service = new UserService(repo);

        repo.countAdmins.mockResolvedValue(3);

        await expect(service.countAdmins()).resolves.toBe(3);
        expect(repo.countAdmins).toHaveBeenCalled();
    });

    it('should throw NotFoundError when user does not exist', async () => {
        const repo = createRepoMock();
        const service = new UserService(repo);

        repo.findById.mockResolvedValue(null);

        await expect(service.getById(999)).rejects.toBeInstanceOf(NotFoundError);
    });
});

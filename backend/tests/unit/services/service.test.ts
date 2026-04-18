/// <reference types="jest" />

import { ServiceService } from '../../../src/modules/services/service.service';
import type { IServiceRepository } from '../../../src/modules/services/service.repository';
import type { IUserService } from '../../../src/modules/users/user.service';
import {
    ConflictError,
    NotFoundError,
} from '../../../src/shared/errors/domain.error';

function createRepoMock(): jest.Mocked<IServiceRepository> {
    return {
        create: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        existsById: jest.fn(),
        existsByName: jest.fn(),
    };
}

function createUserServiceMock(): jest.Mocked<IUserService> {
    return {
        add: jest.fn(),
        addFirstAdmin: jest.fn(),
        existsByIdAndRole: jest.fn(),
        getById: jest.fn(),
        getByIdentifier: jest.fn(),
        getAll: jest.fn(),
        update: jest.fn(),
        updatePassword: jest.fn(),
        countAdmins: jest.fn(),
    };
}

describe('ServiceService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('add', () => {
        it('should create a new service', async () => {
            const repo = createRepoMock();
            const userService = createUserServiceMock();
            const service = new ServiceService(repo, userService);

            const input = {
                workerId: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte de cabello profesional',
                color: '#FF5733',
                price: 50000,
                duration: 30,
            };

            const mockService = {
                id: 1,
                workerId: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte de cabello profesional',
                colorHex: '#FF5733',
                defaultPrice: 50000,
                defaultDurationMin: 30,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            userService.existsByIdAndRole.mockResolvedValue(true);
            repo.existsByName.mockResolvedValue(false);
            repo.create.mockResolvedValue(mockService);

            const result = await service.add(input);

            expect(result).toEqual({
                id: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte de cabello profesional',
                color: '#FF5733',
                price: 50000,
                duration: 30,
                isActive: true,
            });
            expect(userService.existsByIdAndRole).toHaveBeenCalledWith(
                1,
                'WORKER',
            );
            expect(repo.existsByName).toHaveBeenCalledWith(
                1,
                'Corte de cabello',
            );
            expect(repo.create).toHaveBeenCalled();
        });

        it('should throw NotFoundError when worker does not exist', async () => {
            const repo = createRepoMock();
            const userService = createUserServiceMock();
            const service = new ServiceService(repo, userService);

            const input = {
                workerId: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte de cabello profesional',
                color: '#FF5733',
                price: 50000,
                duration: 30,
            };

            userService.existsByIdAndRole.mockResolvedValue(false);

            await expect(service.add(input)).rejects.toBeInstanceOf(
                NotFoundError,
            );
            expect(repo.existsByName).not.toHaveBeenCalled();
            expect(repo.create).not.toHaveBeenCalled();
        });

        it('should throw ConflictError when service name already exists for worker', async () => {
            const repo = createRepoMock();
            const userService = createUserServiceMock();
            const service = new ServiceService(repo, userService);

            const input = {
                workerId: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte de cabello profesional',
                color: '#FF5733',
                price: 50000,
                duration: 30,
            };

            userService.existsByIdAndRole.mockResolvedValue(true);
            repo.existsByName.mockResolvedValue(true);

            await expect(service.add(input)).rejects.toBeInstanceOf(
                ConflictError,
            );
            expect(repo.create).not.toHaveBeenCalled();
        });
    });

    describe('getById', () => {
        it('should return a service by id', async () => {
            const repo = createRepoMock();
            const userService = createUserServiceMock();
            const service = new ServiceService(repo, userService);

            const mockService = {
                id: 1,
                workerId: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte de cabello profesional',
                colorHex: '#FF5733',
                defaultPrice: 50000,
                defaultDurationMin: 30,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            repo.findById.mockResolvedValue(mockService);

            const result = await service.getById(1);

            expect(result).toEqual({
                id: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte de cabello profesional',
                color: '#FF5733',
                price: 50000,
                duration: 30,
                isActive: true,
            });
            expect(repo.findById).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundError when service does not exist', async () => {
            const repo = createRepoMock();
            const userService = createUserServiceMock();
            const service = new ServiceService(repo, userService);

            repo.findById.mockResolvedValue(null);

            await expect(service.getById(999)).rejects.toBeInstanceOf(
                NotFoundError,
            );
        });
    });

    describe('getAll', () => {
        it('should return all services', async () => {
            const repo = createRepoMock();
            const userService = createUserServiceMock();
            const service = new ServiceService(repo, userService);

            const mockServices = [
                {
                    id: 1,
                    workerId: 1,
                    name: 'Corte de cabello',
                    description: 'Servicio de corte de cabello profesional',
                    colorHex: '#FF5733',
                    defaultPrice: 50000,
                    defaultDurationMin: 30,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 2,
                    workerId: 1,
                    name: 'Tintura',
                    description: 'Servicio de tintura de cabello',
                    colorHex: '#FF5733',
                    defaultPrice: 75000,
                    defaultDurationMin: 60,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            repo.findAll.mockResolvedValue(mockServices);

            const result = await service.getAll({});

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                id: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte de cabello profesional',
                color: '#FF5733',
                price: 50000,
                duration: 30,
                isActive: true,
            });
        });

        it('should return services filtered by workerId', async () => {
            const repo = createRepoMock();
            const userService = createUserServiceMock();
            const service = new ServiceService(repo, userService);

            const mockServices = [
                {
                    id: 1,
                    workerId: 1,
                    name: 'Corte de cabello',
                    description: 'Servicio de corte de cabello profesional',
                    colorHex: '#FF5733',
                    defaultPrice: 50000,
                    defaultDurationMin: 30,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            repo.findAll.mockResolvedValue(mockServices);

            const result = await service.getAll({ workerId: 1 });

            expect(result).toHaveLength(1);
            expect(repo.findAll).toHaveBeenCalledWith({ workerId: 1 });
        });
    });

    describe('update', () => {
        it('should update a service', async () => {
            const repo = createRepoMock();
            const userService = createUserServiceMock();
            const service = new ServiceService(repo, userService);

            const existingService = {
                id: 1,
                workerId: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte de cabello profesional',
                colorHex: '#FF5733',
                defaultPrice: 50000,
                defaultDurationMin: 30,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const updatedService = {
                ...existingService,
                name: 'Corte premium',
                defaultPrice: 75000,
            };

            repo.findById
                .mockResolvedValueOnce(existingService)
                .mockResolvedValueOnce(updatedService);
            repo.existsByName.mockResolvedValue(false);
            repo.update.mockResolvedValue(updatedService);

            const result = await service.update({
                id: 1,
                name: 'Corte premium',
                price: 75000,
            });

            expect(result).toEqual({
                id: 1,
                name: 'Corte premium',
                description: 'Servicio de corte de cabello profesional',
                color: '#FF5733',
                price: 75000,
                duration: 30,
                isActive: true,
            });
            expect(repo.update).toHaveBeenCalled();
        });

        it('should throw NotFoundError when service does not exist', async () => {
            const repo = createRepoMock();
            const userService = createUserServiceMock();
            const service = new ServiceService(repo, userService);

            repo.findById.mockResolvedValue(null);

            await expect(
                service.update({ id: 999, name: 'Nuevo nombre' }),
            ).rejects.toBeInstanceOf(NotFoundError);
            expect(repo.update).not.toHaveBeenCalled();
        });

        it('should verify name uniqueness when updating service name', async () => {
            const repo = createRepoMock();
            const userService = createUserServiceMock();
            const service = new ServiceService(repo, userService);

            const existingService = {
                id: 1,
                workerId: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte de cabello profesional',
                colorHex: '#FF5733',
                defaultPrice: 50000,
                defaultDurationMin: 30,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            repo.findById.mockResolvedValue(existingService);
            repo.existsByName.mockResolvedValue(true);

            await expect(
                service.update({
                    id: 1,
                    name: 'Nuevo nombre',
                }),
            ).rejects.toBeInstanceOf(ConflictError);
            expect(repo.update).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should delete a service', async () => {
            const repo = createRepoMock();
            const userService = createUserServiceMock();
            const service = new ServiceService(repo, userService);

            const mockService = {
                id: 1,
                workerId: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte de cabello profesional',
                colorHex: '#FF5733',
                defaultPrice: 50000,
                defaultDurationMin: 30,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            repo.findById.mockResolvedValue(mockService);
            (repo.delete as jest.Mock).mockImplementation(() =>
                Promise.resolve(),
            );

            await service.delete(1);

            expect(repo.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundError when service does not exist', async () => {
            const repo = createRepoMock();
            const userService = createUserServiceMock();
            const service = new ServiceService(repo, userService);

            repo.findById.mockResolvedValue(null);

            await expect(service.delete(999)).rejects.toBeInstanceOf(
                NotFoundError,
            );
            expect(repo.delete).not.toHaveBeenCalled();
        });
    });

    describe('existsById', () => {
        it('should return true when service exists', async () => {
            const repo = createRepoMock();
            const userService = createUserServiceMock();
            const service = new ServiceService(repo, userService);

            repo.existsById.mockResolvedValue(true);

            const result = await service.existsById(1);

            expect(result).toBe(true);
            expect(repo.existsById).toHaveBeenCalledWith(1);
        });

        it('should return false when service does not exist', async () => {
            const repo = createRepoMock();
            const userService = createUserServiceMock();
            const service = new ServiceService(repo, userService);

            repo.existsById.mockResolvedValue(false);

            const result = await service.existsById(999);

            expect(result).toBe(false);
        });
    });
});

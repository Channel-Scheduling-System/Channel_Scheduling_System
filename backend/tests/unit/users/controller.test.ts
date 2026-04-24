/// <reference types="jest" />

import { UserController } from '../../../src/modules/users/user.controller';

describe('UserController', () => {
    const createUserServiceMock = () => ({
        add: jest.fn(),
        addFirstAdmin: jest.fn(),
        existsByIdAndRole: jest.fn(),
        getById: jest.fn(),
        getByIdentifier: jest.fn(),
        getAll: jest.fn(),
        update: jest.fn(),
        updatePassword: jest.fn(),
        updateState: jest.fn(),
        deactivateMe: jest.fn(),
        countAdmins: jest.fn(),
    });

    it('should register a user', async () => {
        const userService = createUserServiceMock();
        userService.add.mockResolvedValue(undefined);
        const controller = new UserController(userService as any);

        const req = {
            body: {
                alias: 'johangil',
                firstName: 'Johan',
                lastName: 'Gil',
                phone: '3001234567',
                email: 'johan@test.com',
                password: 'Password123!',
                role: 'CLIENT',
            },
            user: {
                role: 'ADMIN',
                sub: 99,
            },
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;
        const next = jest.fn();

        await controller.add(req, res, next);

        expect(userService.add).toHaveBeenCalledWith(req.body, {
            id: 99,
            role: 'ADMIN',
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Usuario registrado exitosamente',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should register the first admin', async () => {
        const userService = createUserServiceMock();
        userService.addFirstAdmin.mockResolvedValue(undefined);
        const controller = new UserController(userService as any);

        const req = {
            body: {
                alias: 'adminone',
                firstName: 'Admin',
                lastName: 'One',
                phone: '3000000001',
                email: 'admin@test.com',
                password: 'Password123!',
                secretCode: '1234567890',
            },
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;
        const next = jest.fn();

        await controller.addFirstAdmin(req, res, next);

        expect(userService.addFirstAdmin).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Administrador registrado exitosamente',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return a user by id', async () => {
        const userService = createUserServiceMock();
        userService.getById.mockResolvedValue({
            id: 1,
            alias: 'workerone',
            firstName: 'Johan',
            lastName: 'Gil',
            phone: '3001234567',
            email: 'worker@test.com',
            role: 'WORKER',
            isActive: true,
        });
        const controller = new UserController(userService as any);

        const req = {
            params: { id: '1' },
            user: {
                role: 'ADMIN',
                sub: 99,
            },
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;
        const next = jest.fn();

        await controller.getById(req, res, next);

        expect(userService.getById).toHaveBeenCalledWith(1, {
            role: 'ADMIN',
            id: 99,
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Usuario recuperado exitosamente',
            data: {
                id: 1,
                alias: 'workerone',
                firstName: 'Johan',
                lastName: 'Gil',
                phone: '3001234567',
                email: 'worker@test.com',
                role: 'WORKER',
                isActive: true,
            },
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should list users with pagination', async () => {
        const userService = createUserServiceMock();
        userService.getAll.mockResolvedValue({
            data: [
                {
                    id: 1,
                    alias: 'workerone',
                    firstName: 'Johan',
                    lastName: 'Gil',
                    phone: '3001234567',
                    email: 'worker@test.com',
                    role: 'WORKER',
                    isActive: true,
                },
            ],
            meta: {
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
            },
        });
        const controller = new UserController(userService as any);

        const req = {
            query: {
                page: '1',
                limit: '10',
            },
            user: {
                role: 'ADMIN',
                sub: 99,
            },
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;
        const next = jest.fn();

        await controller.getAll(req, res, next);

        expect(userService.getAll).toHaveBeenCalledWith(
            { page: 1, limit: 10 },
            {},
            'ADMIN',
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Usuarios recuperados exitosamente',
            data: [
                {
                    id: 1,
                    alias: 'workerone',
                    firstName: 'Johan',
                    lastName: 'Gil',
                    phone: '3001234567',
                    email: 'worker@test.com',
                    role: 'WORKER',
                    isActive: true,
                },
            ],
            meta: {
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
            },
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should update a user', async () => {
        const userService = createUserServiceMock();
        userService.update.mockResolvedValue({
            id: 1,
            alias: 'workerone',
            firstName: 'Carlos',
            lastName: 'Gil',
            phone: '3001234567',
            email: 'worker@test.com',
            role: 'WORKER',
            isActive: true,
        });
        const controller = new UserController(userService as any);

        const req = {
            params: { id: '1' },
            body: {
                firstName: 'Carlos',
            },
            user: {
                role: 'ADMIN',
                sub: 99,
            },
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;
        const next = jest.fn();

        await controller.update(req, res, next);

        expect(userService.update).toHaveBeenCalledWith(
            { id: 1, firstName: 'Carlos' },
            { role: 'ADMIN', id: 99 },
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Usuario actualizado exitosamente',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should update password for the authenticated user', async () => {
        const userService = createUserServiceMock();
        userService.updatePassword.mockResolvedValue(undefined);
        const controller = new UserController(userService as any);

        const req = {
            params: { id: '1' },
            body: {
                password: 'OldPass123!',
                newPassword: 'NewPass123!',
            },
            user: {
                role: 'CLIENT',
                sub: 1,
            },
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;
        const next = jest.fn();

        await controller.updatePassword(req, res, next);

        expect(userService.updatePassword).toHaveBeenCalledWith(
            { id: 1, password: 'OldPass123!', newPassword: 'NewPass123!' },
            { role: 'CLIENT', id: 1 },
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Su Contraseña se ha actualizado exitosamente',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should activate a user successfully', async () => {
        const userService = createUserServiceMock();
        userService.updateState.mockResolvedValue(true);
        const controller = new UserController(userService as any);

        const req = {
            params: { id: '2' },
            body: { isActive: true },
            user: { role: 'ADMIN', sub: 99 },
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;
        const next = jest.fn();

        await controller.updateState(req, res, next);

        expect(userService.updateState).toHaveBeenCalledWith(
            { id: 2, isActive: true },
            { id: 99, role: 'ADMIN' },
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Usuario activado exitosamente',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should deactivate a user successfully', async () => {
        const userService = createUserServiceMock();
        userService.updateState.mockResolvedValue(false);
        const controller = new UserController(userService as any);

        const req = {
            params: { id: '2' },
            body: { isActive: false },
            user: { role: 'ADMIN', sub: 99 },
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;
        const next = jest.fn();

        await controller.updateState(req, res, next);

        expect(userService.updateState).toHaveBeenCalledWith(
            { id: 2, isActive: false },
            { id: 99, role: 'ADMIN' },
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Usuario desactivado exitosamente',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should deactivate own account successfully', async () => {
        const userService = createUserServiceMock();
        userService.deactivateMe.mockResolvedValue(undefined);
        const controller = new UserController(userService as any);

        const req = {
            body: { password: 'Password123!' },
            user: { role: 'CLIENT', sub: 5 },
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;
        const next = jest.fn();

        await controller.deactivateMe(req, res, next);

        expect(userService.deactivateMe).toHaveBeenCalledWith('Password123!', {
            id: 5,
            role: 'CLIENT',
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Su cuenta ha sido desactivada exitosamente',
        });
        expect(next).not.toHaveBeenCalled();
    });
});

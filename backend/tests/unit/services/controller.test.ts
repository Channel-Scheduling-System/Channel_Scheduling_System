/// <reference types="jest" />

import { ServiceController } from '../../../src/modules/services/service.controller';
describe('ServiceController', () => {
    it('should return 201 and data on add success', async () => {
        const serviceService = {
            add: jest.fn().mockResolvedValue({
                id: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte profesional',
                color: '#FF5733',
                price: 50000,
                duration: 30,
            }),
            getById: jest.fn(),
            getAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            existsById: jest.fn(),
        };

        const controller = new ServiceController(serviceService as any);

        const req = {
            body: {
                workerId: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte profesional',
                color: '#FF5733',
                price: 50000,
                duration: 30,
            },
        } as any;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        const next = jest.fn();

        await controller.add(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Servicio creado exitosamente',
        });
        expect(serviceService.add).toHaveBeenCalledWith(req.body);
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 200 and data on getById success', async () => {
        const serviceService = {
            add: jest.fn(),
            getById: jest.fn().mockResolvedValue({
                id: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte profesional',
                color: '#FF5733',
                price: 50000,
                duration: 30,
            }),
            getAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            existsById: jest.fn(),
        };

        const controller = new ServiceController(serviceService as any);

        const req = {
            params: { id: '1' },
        } as any;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        const next = jest.fn();

        await controller.getById(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Servicio recuperado exitosamente',
            data: expect.objectContaining({
                id: 1,
                name: 'Corte de cabello',
            }),
        });
        expect(serviceService.getById).toHaveBeenCalledWith('1');
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 200 and data array on getAll success', async () => {
        const mockServices = [
            {
                id: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte profesional',
                color: '#FF5733',
                price: 50000,
                duration: 30,
            },
            {
                id: 2,
                name: 'Tintura',
                description: 'Servicio de tintura profesional',
                color: '#FF5733',
                price: 75000,
                duration: 60,
            },
        ];

        const serviceService = {
            add: jest.fn(),
            getById: jest.fn(),
            getAll: jest.fn().mockResolvedValue(mockServices),
            update: jest.fn(),
            delete: jest.fn(),
            existsById: jest.fn(),
        };

        const controller = new ServiceController(serviceService as any);

        const req = {
            query: { workerId: '1' },
        } as any;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        const next = jest.fn();

        await controller.getAll(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Servicios recuperados exitosamente',
            data: expect.arrayContaining([
                expect.objectContaining({ id: 1 }),
                expect.objectContaining({ id: 2 }),
            ]),
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 200 and data on update success', async () => {
        const serviceService = {
            add: jest.fn(),
            getById: jest.fn(),
            getAll: jest.fn(),
            update: jest.fn().mockResolvedValue({
                id: 1,
                name: 'Corte premium',
                description: 'Servicio de corte premium',
                color: '#FF5733',
                price: 75000,
                duration: 45,
            }),
            delete: jest.fn(),
            existsById: jest.fn(),
        };

        const controller = new ServiceController(serviceService as any);

        const req = {
            params: { id: '1' },
            body: {
                name: 'Corte premium',
                price: 75000,
            },
        } as any;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        const next = jest.fn();

        await controller.update(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Servicio actualizado exitosamente',
        });
        expect(serviceService.update).toHaveBeenCalledWith({
            id: '1',
            ...req.body,
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 200 on delete success', async () => {
        const serviceService = {
            add: jest.fn(),
            getById: jest.fn(),
            getAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn().mockResolvedValue(undefined),
            existsById: jest.fn(),
        };

        const controller = new ServiceController(serviceService as any);

        const req = {
            params: { id: '1' },
        } as any;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        const next = jest.fn();

        await controller.delete(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Servicio eliminado exitosamente',
        });
        expect(serviceService.delete).toHaveBeenCalledWith('1');
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error on add failure', async () => {
        const error = new Error('Database error');
        const serviceService = {
            add: jest.fn().mockRejectedValue(error),
            getById: jest.fn(),
            getAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            existsById: jest.fn(),
        };

        const controller = new ServiceController(serviceService as any);

        const req = {
            body: {
                workerId: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte profesional',
                color: '#FF5733',
                price: 50000,
                duration: 30,
            },
        } as any;

        const res = {} as any;
        const next = jest.fn();

        await controller.add(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next with error on getById failure', async () => {
        const error = new Error('Not found');
        const serviceService = {
            add: jest.fn(),
            getById: jest.fn().mockRejectedValue(error),
            getAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            existsById: jest.fn(),
        };

        const controller = new ServiceController(serviceService as any);

        const req = {
            params: { id: '999' },
        } as any;

        const res = {} as any;
        const next = jest.fn();

        await controller.getById(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

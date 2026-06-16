/// <reference types="jest" />

import { AvailabilityController } from '../../../src/modules/availability/availability.controller';

describe('AvailabilityController', () => {
    it('should return 201 when setting working hours succeeds', async () => {
        const availabilityService = {
            addWorkingHours: jest.fn().mockResolvedValue(undefined),
            addTimeOff: jest.fn(),
            addDayOff: jest.fn(),
            addPeriodOff: jest.fn(),
            delete: jest.fn(),
        } as any;

        const controller = new AvailabilityController(availabilityService);

        const req = {
            params: { id: '7' },
            body: {
                workingHours: [
                    {
                        dayOfWeek: 'MONDAY',
                        startTime: '08:00:00Z',
                        endTime: '12:00:00Z',
                    },
                    {
                        dayOfWeek: 'WEDNESDAY',
                        startTime: '13:00:00Z',
                        endTime: '18:00:00Z',
                    },
                ],
            },
        } as any;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        const next = jest.fn();

        await controller.addWorkingHours(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Horario establecido correctamente',
        });
        expect(availabilityService.addWorkingHours).toHaveBeenCalledWith({
            workerId: '7',
            workingHours: req.body.workingHours,
        });
        expect(next).not.toHaveBeenCalled();
    });

    describe('addDayOff', () => {
        it('should return 201 when adding a day off succeeds', async () => {
            const availabilityService = {
                addWorkingHours: jest.fn(),
                addTimeOff: jest.fn(),
                addDayOff: jest.fn().mockResolvedValue(undefined),
                addPeriodOff: jest.fn(),
                delete: jest.fn(),
            } as any;

            const controller = new AvailabilityController(availabilityService);

            const req = {
                params: { id: '7' },
                body: {
                    date: '2026-05-20',
                    reason: 'Personal',
                },
            } as any;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            const next = jest.fn();

            await controller.addDayOff(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Dia bloqueado correctamente',
            });
            expect(availabilityService.addDayOff).toHaveBeenCalledWith({
                workerId: '7',
                date: '2026-05-20',
                reason: 'Personal',
            });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('addPeriodOff', () => {
        it('should return 201 when adding a period off succeeds', async () => {
            const availabilityService = {
                addWorkingHours: jest.fn(),
                addTimeOff: jest.fn(),
                addDayOff: jest.fn(),
                addPeriodOff: jest.fn().mockResolvedValue(undefined),
                delete: jest.fn(),
            } as any;

            const controller = new AvailabilityController(availabilityService);

            const req = {
                params: { id: '7' },
                body: {
                    startDate: '2026-06-01',
                    endDate: '2026-06-05',
                    reason: 'Vacation',
                },
            } as any;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            const next = jest.fn();

            await controller.addPeriodOff(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Periodo bloqueado correctamente',
            });
            expect(availabilityService.addPeriodOff).toHaveBeenCalledWith({
                workerId: '7',
                startDate: '2026-06-01',
                endDate: '2026-06-05',
                reason: 'Vacation',
            });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should return 200 when deleting a blocked time succeeds', async () => {
            const availabilityService = {
                delete: jest.fn().mockResolvedValue(undefined),
            } as any;

            const controller = new AvailabilityController(availabilityService);

            const req = {
                params: { id: '3' },
                user: { sub: 7, role: 'WORKER' },
            } as any;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            const next = jest.fn();

            await controller.delete(req, res, next);

            expect(availabilityService.delete).toHaveBeenCalledWith(3, {
                id: 7,
                role: 'WORKER',
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Bloque de tiempo desbloqueado correctamente',
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when delete throws', async () => {
            const error = new Error('Not found');
            const availabilityService = {
                delete: jest.fn().mockRejectedValue(error),
            } as any;

            const controller = new AvailabilityController(availabilityService);
            const req = { params: { id: '3' }, user: { sub: 7, role: 'WORKER' } } as any;
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
            const next = jest.fn();

            await controller.delete(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('addTimeOff', () => {
        it('should return 201 when adding a time off succeeds', async () => {
            const availabilityService = {
                addTimeOff: jest.fn().mockResolvedValue(undefined),
            } as any;

            const controller = new AvailabilityController(availabilityService);

            const req = {
                params: { id: '7' },
                body: {
                    type: 'RECURRING',
                    dayOfWeek: 'MONDAY',
                    startTime: '09:00',
                    endTime: '11:00',
                    reason: 'Training',
                },
            } as any;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            const next = jest.fn();

            await controller.addTimeOff(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Tiempo bloqueado correctamente',
            });
            expect(availabilityService.addTimeOff).toHaveBeenCalledWith(
                expect.objectContaining({ workerId: '7', type: 'RECURRING' }),
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when addTimeOff throws', async () => {
            const error = new Error('Conflict');
            const availabilityService = {
                addTimeOff: jest.fn().mockRejectedValue(error),
            } as any;

            const controller = new AvailabilityController(availabilityService);
            const req = { params: { id: '7' }, body: {} } as any;
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
            const next = jest.fn();

            await controller.addTimeOff(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getBasicAvailability', () => {
        it('should return 200 with availability data', async () => {
            const availabilityService = {
                getBasicAvailability: jest.fn().mockResolvedValue([]),
            } as any;

            const controller = new AvailabilityController(availabilityService);

            const req = {
                params: { id: '7' },
                query: { view: 'DAY', date: '2027-06-14' },
            } as any;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            const next = jest.fn();

            await controller.getBasicAvailability(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ data: [] }),
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when getBasicAvailability throws', async () => {
            const error = new Error('Service unavailable');
            const availabilityService = {
                getBasicAvailability: jest.fn().mockRejectedValue(error),
            } as any;

            const controller = new AvailabilityController(availabilityService);
            const req = { params: { id: '7' }, query: {} } as any;
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
            const next = jest.fn();

            await controller.getBasicAvailability(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getFullAvailability', () => {
        it('should return 200 with full availability data', async () => {
            const availabilityService = {
                getFullAvailability: jest.fn().mockResolvedValue({}),
            } as any;

            const controller = new AvailabilityController(availabilityService);

            const req = {
                params: { id: '7' },
                user: { sub: 1, role: 'ADMIN' },
                query: {},
            } as any;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            const next = jest.fn();

            await controller.getFullAvailability(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ data: {} }),
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when getFullAvailability throws', async () => {
            const error = new Error('Unauthorized');
            const availabilityService = {
                getFullAvailability: jest.fn().mockRejectedValue(error),
            } as any;

            const controller = new AvailabilityController(availabilityService);
            const req = {
                params: { id: '7' },
                user: { sub: 1, role: 'ADMIN' },
                query: {},
            } as any;
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
            const next = jest.fn();

            await controller.getFullAvailability(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
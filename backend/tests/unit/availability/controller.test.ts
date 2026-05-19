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
});
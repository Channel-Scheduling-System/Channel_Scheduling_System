/// <reference types="jest" />

import { AvailabilityController } from '../../../src/modules/availability/availability.controller';

describe('AvailabilityController - addDayOff', () => {
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

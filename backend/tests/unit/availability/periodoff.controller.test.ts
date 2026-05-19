/// <reference types="jest" />

import { AvailabilityController } from '../../../src/modules/availability/availability.controller';

describe('AvailabilityController - addPeriodOff', () => {
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

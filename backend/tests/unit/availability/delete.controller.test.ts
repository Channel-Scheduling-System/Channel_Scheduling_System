/// <reference types="jest" />

import { AvailabilityController } from '../../../src/modules/availability/availability.controller';

describe('AvailabilityController - delete', () => {
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
});

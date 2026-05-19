/// <reference types="jest" />

import { AvailabilityService } from '../../../src/modules/availability/availability.service';
import { ForbiddenError } from '../../../src/shared/errors/domain.error';

describe('AvailabilityService - delete', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should delete blocked time when auth matches owner', async () => {
        const availabilityRepo = {
            findBlockedTimeById: jest.fn().mockResolvedValue({
                id: 3,
                workerId: 7,
            }),
            deleteBlockedTime: jest.fn().mockResolvedValue(undefined),
        } as any;

        const userService = {} as any;

        const service = new AvailabilityService(availabilityRepo, userService);

        await service.delete(3, { id: 7, role: 'WORKER' });

        expect(availabilityRepo.findBlockedTimeById).toHaveBeenCalledWith(3);
        expect(availabilityRepo.deleteBlockedTime).toHaveBeenCalledWith(3);
    });

    it('should throw ForbiddenError when auth does not match owner', async () => {
        const availabilityRepo = {
            findBlockedTimeById: jest.fn().mockResolvedValue({
                id: 4,
                workerId: 10,
            }),
            deleteBlockedTime: jest.fn(),
        } as any;

        const userService = {} as any;

        const service = new AvailabilityService(availabilityRepo, userService);

        await expect(
            service.delete(4, { id: 7, role: 'WORKER' }),
        ).rejects.toBeInstanceOf(ForbiddenError);
        expect(availabilityRepo.deleteBlockedTime).not.toHaveBeenCalled();
    });
});

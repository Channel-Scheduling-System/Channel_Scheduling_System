/// <reference types="jest" />

import { AvailabilityService } from '../../../src/modules/availability/availability.service';

describe('AvailabilityService - addPeriodOff', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should validate dates and create a period off', async () => {
        const availabilityRepo = {
            createWorkingHourBulk: jest.fn(),
            deleteWorkingHoursByWorkerId: jest.fn(),
            createBlockedTime: jest.fn().mockResolvedValue(undefined),
            findBlockedTimeById: jest.fn(),
            findAllBlockedTimes: jest.fn().mockResolvedValue([]),
            deleteBlockedTime: jest.fn(),
        } as any;

        const userService = {
            existsByIdAndRole: jest.fn().mockResolvedValue(true),
        } as any;

        const service = new AvailabilityService(availabilityRepo, userService);

        const input = {
            workerId: 7,
            startDate: '2026-06-01',
            endDate: '2026-06-05',
            reason: 'Vacation',
        } as any;

        await service.addPeriodOff(input);

        expect(userService.existsByIdAndRole).toHaveBeenCalledWith(7, 'WORKER');
        expect(availabilityRepo.findAllBlockedTimes).toHaveBeenCalledWith({
            workerId: 7,
        });
        expect(availabilityRepo.createBlockedTime).toHaveBeenCalledWith(
            expect.objectContaining({
                workerId: 7,
                type: 'PERIOD',
                startDate: '2026-06-01T00:00:00Z',
                endDate: '2026-06-05T00:00:00Z',
                reason: 'Vacation',
            }),
        );
    });
});

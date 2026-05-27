/// <reference types="jest" />

import { AvailabilityService } from '../../../src/modules/availability/availability.service';

describe('AvailabilityService - addDayOff', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a day off after validations', async () => {
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
            date: '2027-01-15',
            reason: 'Personal',
        } as any;

        await service.addDayOff(input);

        expect(userService.existsByIdAndRole).toHaveBeenCalledWith(7, 'WORKER');
        expect(availabilityRepo.findAllBlockedTimes).toHaveBeenCalledWith({
            workerId: 7,
        });
        expect(availabilityRepo.createBlockedTime).toHaveBeenCalledWith(
            expect.objectContaining({
                workerId: 7,
                type: 'DAY',
                startDate: '2027-01-15T00:00:00Z',
                reason: 'Personal',
            }),
        );
    });
});

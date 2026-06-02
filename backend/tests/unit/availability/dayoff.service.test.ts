/// <reference types="jest" />

import { AvailabilityService } from '../../../src/modules/availability/availability.service';

describe('AvailabilityService - addDayOff', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    function makeAppointmentService() {
        return {
            getSlots: jest.fn().mockResolvedValue([]),
        } as any;
    }

    it('should create a day off after validations', async () => {
        const availabilityRepo = {
            createWorkingHourBulk: jest.fn(),
            deleteWorkingHoursByWorkerId: jest.fn(),
            createBlockedTime: jest.fn().mockResolvedValue(undefined),
            findBlockedTimeById: jest.fn(),
            findBlockedTimesByWorkerId: jest.fn().mockResolvedValue([]),
            findWorkingHours: jest.fn().mockResolvedValue([]),
            findRecurringTimeOffs: jest.fn().mockResolvedValue([]),
            findSpecificTimeOffs: jest.fn().mockResolvedValue([]),
            findDayOffs: jest.fn().mockResolvedValue([]),
            findPeriodOffs: jest.fn().mockResolvedValue([]),
            findBlockedTimesByDate: jest.fn().mockResolvedValue([]),
            deleteBlockedTime: jest.fn(),
        } as any;

        const userService = {
            existsByIdAndRole: jest.fn().mockResolvedValue(true),
        } as any;

        const service = new AvailabilityService(
            availabilityRepo,
            userService,
            makeAppointmentService(),
        );

        const input = {
            workerId: 7,
            date: '2027-01-15',
            reason: 'Personal',
        } as any;

        await service.addDayOff(input);

        expect(userService.existsByIdAndRole).toHaveBeenCalledWith(7, 'WORKER');
        expect(availabilityRepo.findBlockedTimesByWorkerId).toHaveBeenCalledWith(7);
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

/// <reference types="jest" />

import { AvailabilityService } from '../../../src/modules/availability/availability.service';

describe('AvailabilityService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('addWorkingHours', () => {
        it('should replace the current schedule with the provided working hours only', async () => {
            const availabilityRepo = {
                createWorkingHourBulk: jest.fn().mockResolvedValue(undefined),
                deleteWorkingHoursByWorkerId: jest
                    .fn()
                    .mockResolvedValue(undefined),
                createBlockedTime: jest.fn(),
                findBlockedTimeById: jest.fn(),
                findAllBlockedTimes: jest.fn(),
                deleteBlockedTime: jest.fn(),
            } as any;

            const userService = {
                existsByIdAndRole: jest.fn().mockResolvedValue(true),
            } as any;

            const service = new AvailabilityService(
                availabilityRepo,
                userService,
            );

            const input = {
                workerId: 7,
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
            };

            await service.addWorkingHours(input);

            expect(userService.existsByIdAndRole).toHaveBeenCalledWith(
                7,
                'WORKER',
            );
            expect(availabilityRepo.deleteWorkingHoursByWorkerId).toHaveBeenCalledWith(
                7,
            );
            expect(availabilityRepo.createWorkingHourBulk).toHaveBeenCalledTimes(
                1,
            );
            expect(availabilityRepo.createWorkingHourBulk).toHaveBeenCalledWith(
                [
                    expect.objectContaining({
                        workerId: 7,
                        dayOfWeek: 1,
                    }),
                    expect.objectContaining({
                        workerId: 7,
                        dayOfWeek: 3,
                    }),
                ],
            );
        });
    });
});
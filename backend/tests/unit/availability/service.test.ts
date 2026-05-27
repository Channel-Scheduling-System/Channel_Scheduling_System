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

    describe('addDayOff', () => {
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

    describe('addPeriodOff', () => {
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

    describe('addTimeOff', () => {
        it('should create a RECURRING time-off block', async () => {
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
                type: 'RECURRING',
                dayOfWeek: 'MONDAY',
                startTime: '09:00',
                endTime: '11:00',
                reason: 'Training',
            } as any;

            await service.addTimeOff(input);

            expect(availabilityRepo.findAllBlockedTimes).toHaveBeenCalledWith({ workerId: 7 });
            expect(availabilityRepo.createBlockedTime).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'HOUR', dayOfWeek: 1 }),
            );
        });

        it('should create a SPECIFIC time-off block with date validation', async () => {
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
                type: 'SPECIFIC',
                date: '2027-03-01',
                startTime: '14:00',
                endTime: '16:00',
            } as any;

            await service.addTimeOff(input);

            expect(availabilityRepo.createBlockedTime).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'HOUR', workerId: 7 }),
            );
        });

        it('should throw ConflictError when adding duplicate working days', async () => {
            const availabilityRepo = {
                createWorkingHourBulk: jest.fn(),
                deleteWorkingHoursByWorkerId: jest.fn(),
                createBlockedTime: jest.fn(),
                findBlockedTimeById: jest.fn(),
                findAllBlockedTimes: jest.fn(),
                deleteBlockedTime: jest.fn(),
            } as any;

            const userService = {
                existsByIdAndRole: jest.fn().mockResolvedValue(true),
            } as any;

            const service = new AvailabilityService(availabilityRepo, userService);

            const { ConflictError } = await import('../../../src/shared/errors/domain.error');

            await expect(
                service.addWorkingHours({
                    workerId: 7,
                    workingHours: [
                        { dayOfWeek: 'MONDAY', startTime: '08:00:00Z', endTime: '12:00:00Z' },
                        { dayOfWeek: 'MONDAY', startTime: '13:00:00Z', endTime: '17:00:00Z' },
                    ],
                }),
            ).rejects.toBeInstanceOf(ConflictError);
        });
    });

    describe('delete', () => {
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

            const { ForbiddenError } = await import(
                '../../../src/shared/errors/domain.error'
            );

            await expect(service.delete(4, { id: 7, role: 'WORKER' })).rejects.toBeInstanceOf(ForbiddenError);
            expect(availabilityRepo.deleteBlockedTime).not.toHaveBeenCalled();
        });
    });
});
/// <reference types="jest" />

import { AvailabilityService } from '../../../src/modules/availability/availability.service';

// Full repo mock with all methods from IAvailabilityRepository
function makeRepo(overrides: Record<string, jest.Mock> = {}) {
    return {
        createWorkingHourBulk: jest.fn().mockResolvedValue(undefined),
        deleteWorkingHoursByWorkerId: jest.fn().mockResolvedValue(undefined),
        createBlockedTime: jest.fn().mockResolvedValue(undefined),
        findBlockedTimeById: jest.fn().mockResolvedValue(null),
        findBlockedTimesByWorkerId: jest.fn().mockResolvedValue([]),
        findWorkingHours: jest.fn().mockResolvedValue([]),
        findRecurringTimeOffs: jest.fn().mockResolvedValue([]),
        findSpecificTimeOffs: jest.fn().mockResolvedValue([]),
        findDayOffs: jest.fn().mockResolvedValue([]),
        findPeriodOffs: jest.fn().mockResolvedValue([]),
        findBlockedTimesByDate: jest.fn().mockResolvedValue([]),
        deleteBlockedTime: jest.fn().mockResolvedValue(undefined),
        ...overrides,
    } as any;
}

function makeUserService(exists = true) {
    return { existsByIdAndRole: jest.fn().mockResolvedValue(exists) } as any;
}

describe('AvailabilityService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('addWorkingHours', () => {
        it('should replace the current schedule with the provided working hours only', async () => {
            const availabilityRepo = makeRepo();
            const userService = makeUserService();
            const service = new AvailabilityService(availabilityRepo, userService);

            const input = {
                workerId: 7,
                workingHours: [
                    { dayOfWeek: 'MONDAY', startTime: '08:00:00Z', endTime: '12:00:00Z' },
                    { dayOfWeek: 'WEDNESDAY', startTime: '13:00:00Z', endTime: '18:00:00Z' },
                ],
            };

            await service.addWorkingHours(input);

            expect(userService.existsByIdAndRole).toHaveBeenCalledWith(7, 'WORKER');
            expect(availabilityRepo.deleteWorkingHoursByWorkerId).toHaveBeenCalledWith(7);
            expect(availabilityRepo.createWorkingHourBulk).toHaveBeenCalledTimes(1);
            expect(availabilityRepo.createWorkingHourBulk).toHaveBeenCalledWith([
                expect.objectContaining({ workerId: 7, dayOfWeek: 1 }),
                expect.objectContaining({ workerId: 7, dayOfWeek: 3 }),
            ]);
        });

        it('should throw ConflictError when adding duplicate working days', async () => {
            const availabilityRepo = makeRepo();
            const userService = makeUserService();
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

    describe('addDayOff', () => {
        it('should create a day off after validations', async () => {
            const availabilityRepo = makeRepo();
            const userService = makeUserService();
            const service = new AvailabilityService(availabilityRepo, userService);

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

    describe('addPeriodOff', () => {
        it('should validate dates and create a period off', async () => {
            const availabilityRepo = makeRepo();
            const userService = makeUserService();
            const service = new AvailabilityService(availabilityRepo, userService);

            const input = {
                workerId: 7,
                startDate: '2027-06-01',
                endDate: '2027-06-05',
                reason: 'Vacation',
            } as any;

            await service.addPeriodOff(input);

            expect(userService.existsByIdAndRole).toHaveBeenCalledWith(7, 'WORKER');
            expect(availabilityRepo.findBlockedTimesByWorkerId).toHaveBeenCalledWith(7);
            expect(availabilityRepo.createBlockedTime).toHaveBeenCalledWith(
                expect.objectContaining({
                    workerId: 7,
                    type: 'PERIOD',
                    startDate: '2027-06-01T00:00:00Z',
                    endDate: '2027-06-05T00:00:00Z',
                    reason: 'Vacation',
                }),
            );
        });
    });

    describe('addTimeOff', () => {
        it('should create a RECURRING time-off block', async () => {
            const availabilityRepo = makeRepo();
            const userService = makeUserService();
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

            expect(availabilityRepo.findBlockedTimesByWorkerId).toHaveBeenCalledWith(7);
            expect(availabilityRepo.createBlockedTime).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'HOUR', dayOfWeek: 1 }),
            );
        });

        it('should create a SPECIFIC time-off block with date validation', async () => {
            const availabilityRepo = makeRepo();
            const userService = makeUserService();
            const service = new AvailabilityService(availabilityRepo, userService);

            const input = {
                workerId: 7,
                type: 'SPECIFIC',
                date: '2027-03-01',
                startTime: '14:00',
                endTime: '16:00',
            } as any;

            await service.addTimeOff(input);

            expect(availabilityRepo.findBlockedTimesByWorkerId).toHaveBeenCalledWith(7);
            expect(availabilityRepo.createBlockedTime).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'HOUR', workerId: 7 }),
            );
        });
    });

    describe('getBasicAvailability', () => {
        it('should return empty array when no working hours exist', async () => {
            const availabilityRepo = makeRepo();
            const userService = makeUserService();
            const service = new AvailabilityService(availabilityRepo, userService);

            const filters = { workerId: 7, view: 'DAY' as const, date: '2027-06-10' };
            const result = await service.getBasicAvailability(filters);

            expect(result).toEqual([]);
        });
    });

    describe('getFullAvailability', () => {
        it('should return empty object when include is empty', async () => {
            const availabilityRepo = makeRepo();
            const userService = makeUserService();
            const service = new AvailabilityService(availabilityRepo, userService);

            const filters = { workerId: 7, include: [] };
            const result = await service.getFullAvailability(filters);

            expect(result).toEqual({});
        });
    });

    describe('delete', () => {
        it('should delete blocked time when auth matches owner', async () => {
            const availabilityRepo = makeRepo({
                findBlockedTimeById: jest.fn().mockResolvedValue({ id: 3, workerId: 7 }),
                deleteBlockedTime: jest.fn().mockResolvedValue(undefined),
            });
            const userService = {} as any;
            const service = new AvailabilityService(availabilityRepo, userService);

            await service.delete(3, { id: 7, role: 'WORKER' });

            expect(availabilityRepo.findBlockedTimeById).toHaveBeenCalledWith(3);
            expect(availabilityRepo.deleteBlockedTime).toHaveBeenCalledWith(3);
        });

        it('should throw ForbiddenError when auth does not match owner', async () => {
            const availabilityRepo = makeRepo({
                findBlockedTimeById: jest.fn().mockResolvedValue({ id: 4, workerId: 10 }),
                deleteBlockedTime: jest.fn(),
            });
            const userService = {} as any;
            const service = new AvailabilityService(availabilityRepo, userService);

            const { ForbiddenError } = await import('../../../src/shared/errors/domain.error');

            await expect(service.delete(4, { id: 7, role: 'WORKER' })).rejects.toBeInstanceOf(ForbiddenError);
            expect(availabilityRepo.deleteBlockedTime).not.toHaveBeenCalled();
        });

        it('should throw NotFoundError when blocked time does not exist', async () => {
            const availabilityRepo = makeRepo({
                findBlockedTimeById: jest.fn().mockResolvedValue(null),
            });
            const userService = {} as any;
            const service = new AvailabilityService(availabilityRepo, userService);

            const { NotFoundError } = await import('../../../src/shared/errors/domain.error');

            await expect(service.delete(99, { id: 7, role: 'WORKER' })).rejects.toBeInstanceOf(NotFoundError);
        });
    });
});

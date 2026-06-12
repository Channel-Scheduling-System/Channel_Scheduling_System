/// <reference types="jest" />

import { AvailabilityFiltersProcessor } from '../../../src/modules/availability/utils/availability-filters.processor';

function makeRepo(overrides: Record<string, jest.Mock> = {}) {
    return {
        createWorkingHourBulk: jest.fn(),
        deleteWorkingHoursByWorkerId: jest.fn(),
        createBlockedTime: jest.fn(),
        findBlockedTimeById: jest.fn(),
        findBlockedTimesByWorkerId: jest.fn().mockResolvedValue([]),
        findWorkingHours: jest.fn().mockResolvedValue([]),
        findRecurringTimeOffs: jest.fn().mockResolvedValue([]),
        findSpecificTimeOffs: jest.fn().mockResolvedValue([]),
        findDayOffs: jest.fn().mockResolvedValue([]),
        findPeriodOffs: jest.fn().mockResolvedValue([]),
        findBlockedTimesByDate: jest.fn().mockResolvedValue([]),
        deleteBlockedTime: jest.fn(),
        ...overrides,
    } as any;
}

function makeAppointmentService() {
    return { getSlots: jest.fn().mockResolvedValue([]) } as any;
}

const WORKING_HOUR = {
    id: 1,
    workerId: 7,
    dayOfWeek: 1,
    startTime: new Date('1900-01-01T08:00:00Z'),
    endTime: new Date('1900-01-01T17:00:00Z'),
};

describe('AvailabilityFiltersProcessor', () => {
    beforeEach(() => jest.clearAllMocks());

    // ── processFullAvailability ───────────────────────────────────────────────
    describe('processFullAvailability', () => {
        it('should return empty object when include is empty', async () => {
            const processor = new AvailabilityFiltersProcessor(
                makeRepo(),
                makeAppointmentService(),
            );
            const result = await processor.processFullAvailability(7, {
                include: [],
            });
            expect(result).toEqual({});
        });

        it('should include workingHours when requested', async () => {
            const processor = new AvailabilityFiltersProcessor(
                makeRepo(),
                makeAppointmentService(),
            );
            const result = await processor.processFullAvailability(7, {
                include: ['workingHours'],
            });
            expect(result).toHaveProperty('workingHours');
            expect(Array.isArray(result.workingHours)).toBe(true);
        });

        it('should include daysOff when requested', async () => {
            const processor = new AvailabilityFiltersProcessor(
                makeRepo(),
                makeAppointmentService(),
            );
            const result = await processor.processFullAvailability(7, {
                include: ['daysOff'],
            });
            expect(result).toHaveProperty('daysOff');
        });

        it('should include periodsOff when requested', async () => {
            const processor = new AvailabilityFiltersProcessor(
                makeRepo(),
                makeAppointmentService(),
            );
            const result = await processor.processFullAvailability(7, {
                include: ['periodsOff'],
            });
            expect(result).toHaveProperty('periodsOff');
        });

        it('should include timesOff (recurring + specific) when requested', async () => {
            const processor = new AvailabilityFiltersProcessor(
                makeRepo(),
                makeAppointmentService(),
            );
            const result = await processor.processFullAvailability(7, {
                include: ['timesOff'],
            });
            expect(result).toHaveProperty('timesOff');
            expect(result.timesOff).toHaveProperty('recurring');
            expect(result.timesOff).toHaveProperty('specific');
        });

        it('should filter by dayOfWeek when view is DAY', async () => {
            const repo = makeRepo();
            const processor = new AvailabilityFiltersProcessor(
                repo,
                makeAppointmentService(),
            );
            // 2027-06-14 is a Monday → dayOfWeek = 1
            await processor.processFullAvailability(7, {
                include: ['workingHours'],
                view: 'DAY',
                date: '2027-06-14',
            });
            expect(repo.findWorkingHours).toHaveBeenCalledWith({
                workerId: 7,
                dayOfWeek: 1,
            });
        });

        it('should not filter by dayOfWeek when view is WEEK', async () => {
            const repo = makeRepo();
            const processor = new AvailabilityFiltersProcessor(
                repo,
                makeAppointmentService(),
            );
            await processor.processFullAvailability(7, {
                include: ['workingHours'],
                view: 'WEEK',
                date: '2027-06-14',
            });
            expect(repo.findWorkingHours).toHaveBeenCalledWith({ workerId: 7 });
        });

        it('should silently ignore unknown include types', async () => {
            const processor = new AvailabilityFiltersProcessor(
                makeRepo(),
                makeAppointmentService(),
            );
            const result = await processor.processFullAvailability(7, {
                include: ['unknownKey'] as any,
            });
            expect(result).toEqual({});
        });
    });

    // ── getWorkingHours ───────────────────────────────────────────────────────
    describe('getWorkingHours', () => {
        it('should return empty array when no working hours exist', async () => {
            const processor = new AvailabilityFiltersProcessor(
                makeRepo(),
                makeAppointmentService(),
            );
            const result = await processor.getWorkingHours(7);
            expect(result).toEqual([]);
        });

        it('should map and return working hours', async () => {
            const repo = makeRepo({
                findWorkingHours: jest.fn().mockResolvedValue([WORKING_HOUR]),
            });
            const processor = new AvailabilityFiltersProcessor(
                repo,
                makeAppointmentService(),
            );
            const result = await processor.getWorkingHours(7);
            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('dayOfWeek', 'MONDAY');
        });
    });

    // ── getAvailableSlotsForDay ───────────────────────────────────────────────
    describe('getAvailableSlotsForDay', () => {
        it('should return null when no working hours exist for the day', async () => {
            const processor = new AvailabilityFiltersProcessor(
                makeRepo(),
                makeAppointmentService(),
            );
            const result = await processor.getAvailableSlotsForDay({
                workerId: 7,
                date: '2027-06-14',
                dayOfWeek: 1,
            });
            expect(result).toBeNull();
        });

        it('should return available slots when working hours exist and no blocks', async () => {
            const repo = makeRepo({
                findWorkingHours: jest.fn().mockResolvedValue([WORKING_HOUR]),
                findBlockedTimesByDate: jest.fn().mockResolvedValue([]),
            });
            const processor = new AvailabilityFiltersProcessor(
                repo,
                makeAppointmentService(),
            );
            const result = await processor.getAvailableSlotsForDay({
                workerId: 7,
                date: '2027-06-14',
                dayOfWeek: 1,
            });
            expect(Array.isArray(result)).toBe(true);
            expect(result!.length).toBeGreaterThan(0);
        });
    });

    // ── processBasicAvailability ──────────────────────────────────────────────
    describe('processBasicAvailability', () => {
        it('should return empty array when no view or date is provided', async () => {
            const processor = new AvailabilityFiltersProcessor(
                makeRepo(),
                makeAppointmentService(),
            );
            const result = await processor.processBasicAvailability(7, {} as any);
            expect(result).toEqual([]);
        });

        it('should return day availability for DAY view (no working hours → empty)', async () => {
            const processor = new AvailabilityFiltersProcessor(
                makeRepo(),
                makeAppointmentService(),
            );
            const result = await processor.processBasicAvailability(7, {
                view: 'DAY',
                date: '2027-06-14',
            });
            // No working hours → buildDayAvailability returns null → filtered out
            expect(result).toEqual([]);
        });

        it('should return non-null day availabilities for WEEK view', async () => {
            const repo = makeRepo({
                findWorkingHours: jest.fn().mockResolvedValue([WORKING_HOUR]),
                findBlockedTimesByDate: jest.fn().mockResolvedValue([]),
            });
            const appointmentService = makeAppointmentService();
            const processor = new AvailabilityFiltersProcessor(
                repo,
                appointmentService,
            );
            const result = await processor.processBasicAvailability(7, {
                view: 'WEEK',
                date: '2027-06-14',
            });
            // Monday has working hours → at least one day returned
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });
    });
});

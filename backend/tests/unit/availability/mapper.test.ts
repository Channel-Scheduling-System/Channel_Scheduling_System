/// <reference types="jest" />

import {
    mapToCreateWorkingHoursData,
    mapToCreateDayOffData,
    mapToCreateTimeOffData,
    mapToCreatePeriodOffData,
    mapToWorkingHourResponse,
    mapToRecurringTimeOffResponse,
    mapToSpecificTimeOffResponse,
    mapToDaysOffResponse,
    mapToPeriodOffResponse,
    mapWorkingHourToSlot,
    mapBlockedTimeToSlot,
    mapToDayAvailability,
    mapToAvailabilityClientFilter,
    dayOfWeekToNumber,
    numberToDayOfWeek,
} from '../../../src/modules/availability/availability.mapper';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeDate(iso: string) {
    return { toISOString: () => iso } as any;
}

function makeWorkingHour(dayOfWeek: number, startIso: string, endIso: string) {
    return {
        id: 1,
        workerId: 7,
        dayOfWeek,
        startTime: makeDate(startIso),
        endTime: makeDate(endIso),
    } as any;
}

function makeBlockedTime(overrides: Record<string, unknown> = {}) {
    return {
        id: 1,
        workerId: 7,
        type: 'DAY',
        startDate: makeDate('2027-06-10T00:00:00.000Z'),
        endDate: null,
        startTime: null,
        endTime: null,
        dayOfWeek: null,
        reason: null,
        createdAt: new Date(),
        ...overrides,
    } as any;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('availability.mapper', () => {
    // ── dayOfWeekToNumber ─────────────────────────────────────────────────
    describe('dayOfWeekToNumber', () => {
        it('should map all days to the correct number (1-7)', () => {
            expect(dayOfWeekToNumber['MONDAY']).toBe(1);
            expect(dayOfWeekToNumber['TUESDAY']).toBe(2);
            expect(dayOfWeekToNumber['WEDNESDAY']).toBe(3);
            expect(dayOfWeekToNumber['THURSDAY']).toBe(4);
            expect(dayOfWeekToNumber['FRIDAY']).toBe(5);
            expect(dayOfWeekToNumber['SATURDAY']).toBe(6);
            expect(dayOfWeekToNumber['SUNDAY']).toBe(7);
        });
    });

    // ── numberToDayOfWeek ─────────────────────────────────────────────────
    describe('numberToDayOfWeek', () => {
        it('should reverse-map numbers back to day strings', () => {
            expect(numberToDayOfWeek[1]).toBe('MONDAY');
            expect(numberToDayOfWeek[7]).toBe('SUNDAY');
        });
    });

    // ── mapToCreateWorkingHoursData ───────────────────────────────────────
    describe('mapToCreateWorkingHoursData', () => {
        it('should map working hours input to DB format', () => {
            const input = {
                workerId: 10,
                workingHours: [
                    { dayOfWeek: 'MONDAY' as const, startTime: '08:00', endTime: '12:00' },
                    { dayOfWeek: 'FRIDAY' as const, startTime: '13:00', endTime: '17:00' },
                ],
            };

            const result = mapToCreateWorkingHoursData(input);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                workerId: 10,
                dayOfWeek: 1,
                startTime: '1900-01-01T08:00:00Z',
                endTime: '1900-01-01T12:00:00Z',
            });
            expect(result[1]).toEqual({
                workerId: 10,
                dayOfWeek: 5,
                startTime: '1900-01-01T13:00:00Z',
                endTime: '1900-01-01T17:00:00Z',
            });
        });

        it('should return an empty array when workingHours is empty', () => {
            const result = mapToCreateWorkingHoursData({ workerId: 1, workingHours: [] });
            expect(result).toEqual([]);
        });
    });

    // ── mapToCreateDayOffData ─────────────────────────────────────────────
    describe('mapToCreateDayOffData', () => {
        it('should create a DAY type blocked time', () => {
            const input = {
                workerId: 7,
                date: '2026-06-15',
                reason: 'Medical appointment',
            };

            const result = mapToCreateDayOffData(input);

            expect(result).toEqual({
                workerId: 7,
                type: 'DAY',
                startDate: '2026-06-15T00:00:00Z',
                reason: 'Medical appointment',
            });
        });

        it('should work without a reason', () => {
            const result = mapToCreateDayOffData({ workerId: 3, date: '2026-07-04' });
            expect(result.reason).toBeUndefined();
            expect(result.type).toBe('DAY');
        });
    });

    // ── mapToCreatePeriodOffData ──────────────────────────────────────────
    describe('mapToCreatePeriodOffData', () => {
        it('should create a PERIOD type blocked time with start and end dates', () => {
            const input = {
                workerId: 7,
                startDate: '2026-08-01',
                endDate: '2026-08-10',
                reason: 'Vacation',
            };

            const result = mapToCreatePeriodOffData(input);

            expect(result).toEqual({
                workerId: 7,
                type: 'PERIOD',
                startDate: '2026-08-01T00:00:00Z',
                endDate: '2026-08-10T00:00:00Z',
                reason: 'Vacation',
            });
        });
    });

    // ── mapToCreateTimeOffData ────────────────────────────────────────────
    describe('mapToCreateTimeOffData', () => {
        it('should map a RECURRING time-off to the correct DB format', () => {
            const input = {
                workerId: 5,
                type: 'RECURRING' as const,
                dayOfWeek: 'WEDNESDAY' as const,
                startTime: '09:00',
                endTime: '11:00',
                reason: 'Training',
            };

            const result = mapToCreateTimeOffData(input);

            expect(result.type).toBe('HOUR');
            expect(result.workerId).toBe(5);
            expect(result.dayOfWeek).toBe(3); // WEDNESDAY
            expect(result.startDate).toBe('1900-01-01T00:00:00Z');
            expect(result.startTime).toBe('1900-01-01T09:00:00Z');
            expect(result.endTime).toBe('1900-01-01T11:00:00Z');
            expect(result.reason).toBe('Training');
        });

        it('should map a SPECIFIC time-off to the correct DB format', () => {
            const input = {
                workerId: 5,
                type: 'SPECIFIC' as const,
                date: '2026-09-01',
                startTime: '14:00',
                endTime: '16:00',
            };

            const result = mapToCreateTimeOffData(input);

            expect(result.type).toBe('HOUR');
            expect(result.workerId).toBe(5);
            expect(result.dayOfWeek).toBeUndefined();
            expect(result.startDate).toBe('2026-09-01T00:00:00Z');
            expect(result.startTime).toBe('1900-01-01T14:00:00Z');
            expect(result.endTime).toBe('1900-01-01T16:00:00Z');
        });
    });

    // ── mapToWorkingHourResponse ──────────────────────────────────────────
    describe('mapToWorkingHourResponse', () => {
        it('should map a WorkingHour to the response format', () => {
            const wh = makeWorkingHour(1, '1900-01-01T08:00:00.000Z', '1900-01-01T17:00:00.000Z');
            const result = mapToWorkingHourResponse(wh);
            expect(result).toEqual({
                dayOfWeek: 'MONDAY',
                startTime: '08:00',
                endTime: '17:00',
            });
        });

        it('should map FRIDAY correctly', () => {
            const wh = makeWorkingHour(5, '1900-01-01T09:00:00.000Z', '1900-01-01T13:00:00.000Z');
            const result = mapToWorkingHourResponse(wh);
            expect(result.dayOfWeek).toBe('FRIDAY');
        });
    });

    // ── mapToRecurringTimeOffResponse ─────────────────────────────────────
    describe('mapToRecurringTimeOffResponse', () => {
        it('should map a recurring HOUR BlockedTime correctly', () => {
            const block = makeBlockedTime({
                id: 5,
                type: 'HOUR',
                dayOfWeek: 3,
                startTime: makeDate('1900-01-01T09:00:00.000Z'),
                endTime: makeDate('1900-01-01T11:00:00.000Z'),
                reason: 'Training',
            });
            const result = mapToRecurringTimeOffResponse(block);
            expect(result).toEqual({
                id: 5,
                dayOfWeek: 'WEDNESDAY',
                startTime: '09:00',
                endTime: '11:00',
                reason: 'Training',
            });
        });

        it('should default to MONDAY when dayOfWeek is null', () => {
            const block = makeBlockedTime({
                type: 'HOUR',
                dayOfWeek: null,
                startTime: makeDate('1900-01-01T08:00:00.000Z'),
                endTime: makeDate('1900-01-01T09:00:00.000Z'),
            });
            const result = mapToRecurringTimeOffResponse(block);
            expect(result.dayOfWeek).toBe('MONDAY');
        });

        it('should default times to 00:00:00 when null', () => {
            const block = makeBlockedTime({
                type: 'HOUR',
                dayOfWeek: 2,
                startTime: null,
                endTime: null,
            });
            const result = mapToRecurringTimeOffResponse(block);
            expect(result.startTime).toBe('00:00:00');
            expect(result.endTime).toBe('00:00:00');
        });
    });

    // ── mapToSpecificTimeOffResponse ──────────────────────────────────────
    describe('mapToSpecificTimeOffResponse', () => {
        it('should map a specific HOUR BlockedTime correctly', () => {
            const block = makeBlockedTime({
                id: 9,
                type: 'HOUR',
                startDate: makeDate('2027-06-10T00:00:00.000Z'),
                startTime: makeDate('1900-01-01T14:00:00.000Z'),
                endTime: makeDate('1900-01-01T16:00:00.000Z'),
                reason: 'Appointment',
            });
            const result = mapToSpecificTimeOffResponse(block);
            expect(result).toEqual({
                id: 9,
                date: '2027-06-10',
                startTime: '14:00',
                endTime: '16:00',
                reason: 'Appointment',
            });
        });

        it('should default times to 00:00:00 when null', () => {
            const block = makeBlockedTime({ type: 'HOUR', startTime: null, endTime: null });
            const result = mapToSpecificTimeOffResponse(block);
            expect(result.startTime).toBe('00:00:00');
            expect(result.endTime).toBe('00:00:00');
        });
    });

    // ── mapToDaysOffResponse ──────────────────────────────────────────────
    describe('mapToDaysOffResponse', () => {
        it('should map a DAY BlockedTime correctly', () => {
            const block = makeBlockedTime({
                id: 11,
                type: 'DAY',
                startDate: makeDate('2027-07-04T00:00:00.000Z'),
                reason: 'Holiday',
            });
            const result = mapToDaysOffResponse(block);
            expect(result).toEqual({ id: 11, date: '2027-07-04', reason: 'Holiday' });
        });

        it('should omit reason when null', () => {
            const block = makeBlockedTime({ type: 'DAY', reason: null });
            const result = mapToDaysOffResponse(block);
            expect(result.reason).toBeUndefined();
        });
    });

    // ── mapToPeriodOffResponse ────────────────────────────────────────────
    describe('mapToPeriodOffResponse', () => {
        it('should map a PERIOD BlockedTime correctly', () => {
            const block = makeBlockedTime({
                id: 13,
                type: 'PERIOD',
                startDate: makeDate('2027-08-01T00:00:00.000Z'),
                endDate: makeDate('2027-08-10T00:00:00.000Z'),
                reason: 'Vacation',
            });
            const result = mapToPeriodOffResponse(block);
            expect(result).toEqual({
                id: 13,
                startDate: '2027-08-01',
                endDate: '2027-08-10',
                reason: 'Vacation',
            });
        });

        it('should return empty string for endDate when null', () => {
            const block = makeBlockedTime({ type: 'PERIOD', endDate: null });
            const result = mapToPeriodOffResponse(block);
            expect(result.endDate).toBe('');
        });
    });

    // ── mapWorkingHourToSlot ──────────────────────────────────────────────
    describe('mapWorkingHourToSlot', () => {
        it('should extract start and end times as slots', () => {
            const wh = makeWorkingHour(1, '1900-01-01T08:00:00.000Z', '1900-01-01T17:00:00.000Z');
            const result = mapWorkingHourToSlot(wh);
            expect(result).toEqual({ start: '08:00', end: '17:00' });
        });
    });

    // ── mapBlockedTimeToSlot ──────────────────────────────────────────────
    describe('mapBlockedTimeToSlot', () => {
        it('should return full-day slot for a DAY block', () => {
            const block = makeBlockedTime({ type: 'DAY' });
            const result = mapBlockedTimeToSlot(block);
            expect(result).toEqual({ start: '00:00', end: '23:59' });
        });

        it('should extract times for an HOUR block', () => {
            const block = makeBlockedTime({
                type: 'HOUR',
                startTime: makeDate('1900-01-01T09:00:00.000Z'),
                endTime: makeDate('1900-01-01T11:00:00.000Z'),
            });
            const result = mapBlockedTimeToSlot(block);
            expect(result).toEqual({ start: '09:00', end: '11:00' });
        });

        it('should default to 00:00 / 23:59 when times are null', () => {
            const block = makeBlockedTime({ type: 'HOUR', startTime: null, endTime: null });
            const result = mapBlockedTimeToSlot(block);
            expect(result).toEqual({ start: '00:00', end: '23:59' });
        });
    });

    // ── mapToDayAvailability ──────────────────────────────────────────────
    describe('mapToDayAvailability', () => {
        it('should compose the day availability object', () => {
            const available = [{ start: '08:00', end: '12:00' }];
            const occupied = [{ start: '12:00', end: '13:00' }];
            const result = mapToDayAvailability('2027-06-10', available, occupied);
            expect(result).toEqual({
                date: '2027-06-10',
                available,
                occupied,
            });
        });
    });

    // ── mapToAvailabilityClientFilter ─────────────────────────────────────
    describe('mapToAvailabilityClientFilter', () => {
        it('should build a client filter with workerId and provided filters', () => {
            const result = mapToAvailabilityClientFilter(7, {
                view: 'WEEK',
                date: '2027-06-10',
            });
            expect(result).toEqual({ workerId: 7, view: 'WEEK', date: '2027-06-10' });
        });

        it('should return workerId-only filter when filters are empty', () => {
            const result = mapToAvailabilityClientFilter(7, {});
            expect(result.workerId).toBe(7);
        });
    });
});

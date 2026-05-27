/// <reference types="jest" />

import {
    mapToCreateWorkingHoursData,
    mapToCreateDayOffData,
    mapToCreateTimeOffData,
    mapToCreatePeriodOffData,
    dayOfWeekToNumber,
    numberToDayOfWeek,
} from '../../../src/modules/availability/availability.mapper';

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
});

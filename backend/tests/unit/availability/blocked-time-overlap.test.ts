/// <reference types="jest" />

import { BlockedTimeOverlapValidator } from '../../../src/modules/availability/blocked-time-overlap.validator';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Builds a stored BlockedTime (already in the DB) */
function makeBlock(overrides: Record<string, unknown> = {}) {
    return {
        id: 1,
        workerId: 7,
        type: 'DAY',
        startDate: new Date('2026-06-10T00:00:00Z'),
        endDate: null,
        startTime: null,
        endTime: null,
        dayOfWeek: null,
        reason: null,
        createdAt: new Date(),
        ...overrides,
    } as any;
}

/** Builds the input object (new block to create) */
function makeInput(overrides: Record<string, unknown> = {}) {
    return {
        workerId: 7,
        type: 'DAY',
        startDate: '2026-06-10T00:00:00Z',
        endDate: undefined,
        startTime: undefined,
        endTime: undefined,
        ...overrides,
    } as any;
}

/** Returns a Date whose toISOString() contains the given time */
function makeTime(hh: string, mm: string): Date {
    return new Date(`1900-01-01T${hh}:${mm}:00Z`);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('BlockedTimeOverlapValidator', () => {
    const validator = new BlockedTimeOverlapValidator();

    // ── overlaps ──────────────────────────────────────────────────────────
    describe('overlaps()', () => {
        it('should return false when there are no existing blocks', () => {
            const input = makeInput();
            expect(validator.overlaps(input, [])).toBe(false);
        });

        it('should detect overlap for a DAY block on the same date', () => {
            const input = makeInput({ type: 'DAY', startDate: '2026-06-10T00:00:00Z' });
            const existing = makeBlock({ type: 'DAY', startDate: new Date('2026-06-10T00:00:00Z') });

            expect(validator.overlaps(input, [existing])).toBe(true);
        });

        it('should NOT flag a DAY block that coexists with a RECURRING HOUR block', () => {
            // RECURRING HOUR blocks have dayOfWeek != null → isRecurringHour === true
            const input = makeInput({ type: 'DAY', startDate: '2026-06-10T00:00:00Z' });
            const existing = makeBlock({
                type: 'HOUR',
                startDate: new Date('2026-06-10T00:00:00Z'),
                dayOfWeek: 3, // recurring
                startTime: makeTime('09', '00'),
                endTime: makeTime('10', '00'),
            });

            expect(validator.overlaps(input, [existing])).toBe(false);
        });

        it('should detect overlap for a PERIOD block that encompasses existing dates', () => {
            const input = makeInput({
                type: 'PERIOD',
                startDate: '2026-06-08T00:00:00Z',
                endDate: '2026-06-12T00:00:00Z',
            });
            const existing = makeBlock({
                type: 'DAY',
                startDate: new Date('2026-06-10T00:00:00Z'),
            });

            expect(validator.overlaps(input, [existing])).toBe(true);
        });

        it('should NOT overlap when dates are completely separate', () => {
            const input = makeInput({ type: 'DAY', startDate: '2026-07-01T00:00:00Z' });
            const existing = makeBlock({ startDate: new Date('2026-06-10T00:00:00Z') });

            expect(validator.overlaps(input, [existing])).toBe(false);
        });

        it('should detect HOUR overlap on the same day and overlapping time range', () => {
            const input = makeInput({
                type: 'HOUR',
                startDate: '2026-06-10T00:00:00Z',
                startTime: '1900-01-01T09:00:00Z',
                endTime: '1900-01-01T11:00:00Z',
            });
            const existing = makeBlock({
                type: 'HOUR',
                startDate: new Date('2026-06-10T00:00:00Z'),
                dayOfWeek: null, // specific (not recurring)
                startTime: makeTime('10', '00'),
                endTime: makeTime('12', '00'),
            });

            expect(validator.overlaps(input, [existing])).toBe(true);
        });

        it('should NOT flag HOUR overlap when time ranges do not intersect', () => {
            const input = makeInput({
                type: 'HOUR',
                startDate: '2026-06-10T00:00:00Z',
                startTime: '1900-01-01T07:00:00Z',
                endTime: '1900-01-01T09:00:00Z',
            });
            const existing = makeBlock({
                type: 'HOUR',
                startDate: new Date('2026-06-10T00:00:00Z'),
                dayOfWeek: null,
                startTime: makeTime('10', '00'),
                endTime: makeTime('12', '00'),
            });

            expect(validator.overlaps(input, [existing])).toBe(false);
        });

        it('should return true for HOUR input when existing is DAY on same date', () => {
            const input = makeInput({
                type: 'HOUR',
                startDate: '2026-06-10T00:00:00Z',
                startTime: '1900-01-01T09:00:00Z',
                endTime: '1900-01-01T10:00:00Z',
            });
            const existing = makeBlock({
                type: 'DAY',
                startDate: new Date('2026-06-10T00:00:00Z'),
                dayOfWeek: null,
            });

            expect(validator.overlaps(input, [existing])).toBe(true);
        });
    });

    // ── overlapsRecurring ──────────────────────────────────────────────────
    describe('overlapsRecurring()', () => {
        it('should return false when there are no existing blocks', () => {
            const input = {
                workerId: 7,
                type: 'RECURRING',
                dayOfWeek: 'MONDAY' as const,
                startTime: '09:00',
                endTime: '10:00',
            };

            expect(validator.overlapsRecurring(input, [])).toBe(false);
        });

        it('should detect overlap with an existing RECURRING HOUR on the same day', () => {
            const input = {
                workerId: 7,
                type: 'RECURRING',
                dayOfWeek: 'WEDNESDAY' as const,
                startTime: '09:00',
                endTime: '11:00',
            };
            const existing = makeBlock({
                type: 'HOUR',
                dayOfWeek: 3, // WEDNESDAY
                startTime: makeTime('10', '00'),
                endTime: makeTime('12', '00'),
            });

            expect(validator.overlapsRecurring(input, [existing])).toBe(true);
        });

        it('should NOT flag overlap when days differ', () => {
            const input = {
                workerId: 7,
                type: 'RECURRING',
                dayOfWeek: 'MONDAY' as const, // day 1
                startTime: '09:00',
                endTime: '11:00',
            };
            const existing = makeBlock({
                type: 'HOUR',
                dayOfWeek: 3, // WEDNESDAY
                startTime: makeTime('09', '00'),
                endTime: makeTime('11', '00'),
            });

            expect(validator.overlapsRecurring(input, [existing])).toBe(false);
        });

        it('should NOT flag overlap when time ranges do not intersect on same day', () => {
            const input = {
                workerId: 7,
                type: 'RECURRING',
                dayOfWeek: 'FRIDAY' as const, // day 5
                startTime: '07:00',
                endTime: '09:00',
            };
            const existing = makeBlock({
                type: 'HOUR',
                dayOfWeek: 5, // FRIDAY
                startTime: makeTime('10', '00'),
                endTime: makeTime('12', '00'),
            });

            expect(validator.overlapsRecurring(input, [existing])).toBe(false);
        });

        it('should ignore non-HOUR blocks (DAY / PERIOD)', () => {
            const input = {
                workerId: 7,
                type: 'RECURRING',
                dayOfWeek: 'TUESDAY' as const,
                startTime: '08:00',
                endTime: '10:00',
            };
            const existing = makeBlock({ type: 'DAY', dayOfWeek: 2 });

            expect(validator.overlapsRecurring(input, [existing])).toBe(false);
        });
    });
});

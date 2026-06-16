/// <reference types="jest" />

import { SlotCalculator } from '../../../src/modules/availability/utils/slot-calculator';

// Helper: builds a WorkingHour-like object with Date-based times
function makeWorkingHour(startHH: string, endHH: string) {
    return {
        startTime: { toISOString: () => `1900-01-01T${startHH}:00:00.000Z` },
        endTime: { toISOString: () => `1900-01-01T${endHH}:00:00.000Z` },
    } as any;
}

// Helper: builds a BlockedTime-like object
function makeBlockedTime(
    type: 'HOUR' | 'DAY' | 'PERIOD',
    overrides: Record<string, unknown> = {},
) {
    return {
        id: 1,
        workerId: 7,
        type,
        startDate: new Date('2027-06-10T00:00:00Z'),
        endDate: null,
        startTime: null,
        endTime: null,
        dayOfWeek: null,
        reason: null,
        createdAt: new Date(),
        ...overrides,
    } as any;
}

function makeTime(hh: string, mm = '00') {
    return { toISOString: () => `1900-01-01T${hh}:${mm}:00.000Z` };
}

describe('SlotCalculator', () => {
    const calculator = new SlotCalculator();

    // ── No blocked times ───────────────────────────────────────────────────
    describe('no blocked times', () => {
        it('should return the full working slot when no blocks exist', () => {
            const wh = makeWorkingHour('08:00', '17:00');
            const result = calculator.calculateAvailableSlots(wh, []);
            expect(result).toEqual([{ start: '08:00', end: '17:00' }]);
        });
    });

    // ── DAY block ──────────────────────────────────────────────────────────
    describe('DAY blocked time', () => {
        it('should return no available slots when a DAY block covers the full day', () => {
            const wh = makeWorkingHour('08:00', '17:00');
            const block = makeBlockedTime('DAY');
            const result = calculator.calculateAvailableSlots(wh, [block]);
            expect(result).toEqual([]);
        });
    });

    // ── HOUR block (partial) ───────────────────────────────────────────────
    describe('HOUR blocked time (partial)', () => {
        it('should cut out a mid-day block leaving two slots', () => {
            const wh = makeWorkingHour('08:00', '17:00');
            const block = makeBlockedTime('HOUR', {
                startTime: makeTime('10:00'),
                endTime: makeTime('12:00'),
            });
            const result = calculator.calculateAvailableSlots(wh, [block]);
            expect(result).toEqual([
                { start: '08:00', end: '10:00' },
                { start: '12:00', end: '17:00' },
            ]);
        });

        it('should cut out a block at the start of the working day', () => {
            const wh = makeWorkingHour('08:00', '17:00');
            const block = makeBlockedTime('HOUR', {
                startTime: makeTime('08:00'),
                endTime: makeTime('10:00'),
            });
            const result = calculator.calculateAvailableSlots(wh, [block]);
            expect(result).toEqual([{ start: '10:00', end: '17:00' }]);
        });

        it('should cut out a block at the end of the working day', () => {
            const wh = makeWorkingHour('08:00', '17:00');
            const block = makeBlockedTime('HOUR', {
                startTime: makeTime('15:00'),
                endTime: makeTime('17:00'),
            });
            const result = calculator.calculateAvailableSlots(wh, [block]);
            expect(result).toEqual([{ start: '08:00', end: '15:00' }]);
        });
    });

    // ── Multiple blocks ────────────────────────────────────────────────────
    describe('multiple blocked times', () => {
        it('should handle two non-overlapping HOUR blocks', () => {
            const wh = makeWorkingHour('08:00', '17:00');
            const block1 = makeBlockedTime('HOUR', {
                startTime: makeTime('09:00'),
                endTime: makeTime('10:00'),
            });
            const block2 = makeBlockedTime('HOUR', {
                startTime: makeTime('13:00'),
                endTime: makeTime('14:00'),
            });
            const result = calculator.calculateAvailableSlots(wh, [block1, block2]);
            expect(result).toEqual([
                { start: '08:00', end: '09:00' },
                { start: '10:00', end: '13:00' },
                { start: '14:00', end: '17:00' },
            ]);
        });

        it('should merge two overlapping HOUR blocks', () => {
            const wh = makeWorkingHour('08:00', '17:00');
            const block1 = makeBlockedTime('HOUR', {
                startTime: makeTime('09:00'),
                endTime: makeTime('11:00'),
            });
            const block2 = makeBlockedTime('HOUR', {
                startTime: makeTime('10:00'),
                endTime: makeTime('12:00'),
            });
            const result = calculator.calculateAvailableSlots(wh, [block1, block2]);
            expect(result).toEqual([
                { start: '08:00', end: '09:00' },
                { start: '12:00', end: '17:00' },
            ]);
        });

        it('should ignore blocks completely outside the working range', () => {
            const wh = makeWorkingHour('08:00', '12:00');
            const block = makeBlockedTime('HOUR', {
                startTime: makeTime('14:00'),
                endTime: makeTime('16:00'),
            });
            const result = calculator.calculateAvailableSlots(wh, [block]);
            expect(result).toEqual([{ start: '08:00', end: '12:00' }]);
        });
    });
});

/// <reference types="jest" />

import { calculateDataRange } from '../../../src/shared/utils/date-range-calculator.util';

describe('calculateDataRange', () => {

    // ── DAY view ───────────────────────────────────────────────────────────
    describe('DAY view', () => {
        it('should return the same date as start and end', () => {
            const result = calculateDataRange('DAY', '2027-06-15');
            expect(result).toEqual({ startDate: '2027-06-15', endDate: '2027-06-15' });
        });
    });

    // ── WEEK view ──────────────────────────────────────────────────────────
    describe('WEEK view', () => {
        it('should return Monday-Sunday for a mid-week date (Wednesday)', () => {
            // 2027-03-03 is a Wednesday
            const result = calculateDataRange('WEEK', '2027-03-03');
            expect(result).toEqual({ startDate: '2027-03-01', endDate: '2027-03-07' });
        });

        it('should return the same week for a Monday date', () => {
            // 2027-03-01 is a Monday
            const result = calculateDataRange('WEEK', '2027-03-01');
            expect(result).toEqual({ startDate: '2027-03-01', endDate: '2027-03-07' });
        });

        it('should return the same week for a Sunday date', () => {
            // 2027-03-07 is a Sunday
            const result = calculateDataRange('WEEK', '2027-03-07');
            expect(result).toEqual({ startDate: '2027-03-01', endDate: '2027-03-07' });
        });
    });

    // ── MONTH view ─────────────────────────────────────────────────────────
    describe('MONTH view', () => {
        it('should return the full month for a mid-month date', () => {
            const result = calculateDataRange('MONTH', '2027-06-15');
            expect(result).toEqual({ startDate: '2027-06-01', endDate: '2027-06-30' });
        });

        it('should handle February correctly in a non-leap year', () => {
            const result = calculateDataRange('MONTH', '2027-02-15');
            expect(result).toEqual({ startDate: '2027-02-01', endDate: '2027-02-28' });
        });

        it('should handle January', () => {
            const result = calculateDataRange('MONTH', '2027-01-01');
            expect(result).toEqual({ startDate: '2027-01-01', endDate: '2027-01-31' });
        });

        it('should handle December', () => {
            const result = calculateDataRange('MONTH', '2027-12-15');
            expect(result).toEqual({ startDate: '2027-12-01', endDate: '2027-12-31' });
        });
    });
});

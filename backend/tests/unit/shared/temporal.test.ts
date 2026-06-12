/// <reference types="jest" />

import {
    isFutureDate,
    dateToInstant,
    formatTime,
} from '../../../src/shared/utils/temporal.util';

describe('temporal.util', () => {
    // ── isFutureDate ─────────────────────────────────────────────────────────
    describe('isFutureDate', () => {
        it('should return true for a date far in the future', () => {
            expect(isFutureDate('2099-12-31T23:59:00Z')).toBe(true);
        });

        it('should return false for a date in the past', () => {
            expect(isFutureDate('2000-01-01T00:00:00Z')).toBe(false);
        });
    });

    // ── dateToInstant ─────────────────────────────────────────────────────────
    describe('dateToInstant', () => {
        it('should convert a full ISO string to a Temporal.Instant', () => {
            const instant = dateToInstant('2027-06-15T10:00:00Z');
            expect(instant.toJSON()).toBe('2027-06-15T10:00:00Z');
        });

        it('should normalize a date-only string by appending midnight UTC', () => {
            const instant = dateToInstant('2027-06-15');
            expect(instant.toJSON()).toBe('2027-06-15T00:00:00Z');
        });

        it('should convert a Date object to a Temporal.Instant', () => {
            const date = new Date('2027-06-15T10:00:00.000Z');
            const instant = dateToInstant(date);
            expect(instant.toJSON()).toBe('2027-06-15T10:00:00Z');
        });
    });

    // ── formatTime ────────────────────────────────────────────────────────────
    // toZonedDateTime strips the 'Z' and treats the time as-is in Bogota,
    // so the output is purely determined by the numeric hours/minutes in the
    // input string and is timezone-agnostic in the test environment.
    describe('formatTime', () => {
        it('should format a PM time correctly (14:30 → 2:30 PM)', () => {
            expect(formatTime('2027-06-15T14:30:00Z')).toBe('2:30 PM');
        });

        it('should format an AM time correctly (09:05 → 9:05 AM)', () => {
            expect(formatTime('2027-06-15T09:05:00Z')).toBe('9:05 AM');
        });

        it('should format midnight as 12:00 AM', () => {
            expect(formatTime('2027-06-15T00:00:00Z')).toBe('12:00 AM');
        });

        it('should format noon as 12:00 PM', () => {
            expect(formatTime('2027-06-15T12:00:00Z')).toBe('12:00 PM');
        });

        it('should accept a Date object and return a valid HH:MM period string', () => {
            const date = new Date('2027-06-15T15:45:00.000Z');
            expect(formatTime(date)).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
        });
    });
});

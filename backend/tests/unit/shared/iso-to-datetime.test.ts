/// <reference types="jest" />

import {
    isoDateToDateTime,
    isoTimeToDateTime,
    dateTimeToIsoDate,
    dateTimeToIsoTime,
} from '../../../src/shared/utils/iso-to-datetime.util';

describe('iso-to-datetime utilities', () => {
    // ── isoDateToDateTime ─────────────────────────────────────────────────
    describe('isoDateToDateTime', () => {
        it('should convert an ISO date to a DateTime string at midnight UTC', () => {
            expect(isoDateToDateTime('2026-06-01')).toBe('2026-06-01T00:00:00Z');
        });

        it('should work for any valid ISO date', () => {
            expect(isoDateToDateTime('2000-01-01')).toBe('2000-01-01T00:00:00Z');
            expect(isoDateToDateTime('1999-12-31')).toBe('1999-12-31T00:00:00Z');
        });
    });

    // ── isoTimeToDateTime ─────────────────────────────────────────────────
    describe('isoTimeToDateTime', () => {
        it('should wrap a time into a dummy date DateTime string', () => {
            expect(isoTimeToDateTime('08:30')).toBe('1900-01-01T08:30:00Z');
        });

        it('should work for edge times', () => {
            expect(isoTimeToDateTime('00:00')).toBe('1900-01-01T00:00:00Z');
            expect(isoTimeToDateTime('23:59')).toBe('1900-01-01T23:59:00Z');
        });
    });

    // ── dateTimeToIsoDate ─────────────────────────────────────────────────
    describe('dateTimeToIsoDate', () => {
        it('should extract the date part from a DateTime string', () => {
            expect(dateTimeToIsoDate('2026-05-15T00:00:00Z')).toBe('2026-05-15');
        });

        it('should work regardless of the time part', () => {
            expect(dateTimeToIsoDate('2024-03-10T14:30:00Z')).toBe('2024-03-10');
        });
    });

    // ── dateTimeToIsoTime ─────────────────────────────────────────────────
    describe('dateTimeToIsoTime', () => {
        it('should extract HH:MM from a full DateTime string', () => {
            expect(dateTimeToIsoTime('1900-01-01T14:30:00Z')).toBe('14:30');
        });

        it('should return 00:00 when the input is null', () => {
            expect(dateTimeToIsoTime(null)).toBe('00:00');
        });

        it('should return 00:00 when the input is undefined', () => {
            expect(dateTimeToIsoTime(undefined)).toBe('00:00');
        });

        it('should return the same value when already in HH:MM format', () => {
            expect(dateTimeToIsoTime('08:00')).toBe('08:00');
        });

        it('should return 00:00 when format is unrecognised', () => {
            expect(dateTimeToIsoTime('not-a-time')).toBe('00:00');
        });

        it('should extract hours and minutes correctly', () => {
            expect(dateTimeToIsoTime('1900-01-01T00:00:00Z')).toBe('00:00');
            expect(dateTimeToIsoTime('1900-01-01T23:59:00Z')).toBe('23:59');
        });
    });
});

/// <reference types="jest" />

import { DateIterator } from '../../../src/modules/availability/utils/date-iterator';

describe('DateIterator', () => {
    // ── forEach ────────────────────────────────────────────────────────────
    describe('forEach', () => {
        it('should iterate over a single day', () => {
            const visited: string[] = [];
            DateIterator.forEach('2027-03-10', '2027-03-10', (date) => {
                visited.push(date);
            });
            expect(visited).toEqual(['2027-03-10']);
        });

        it('should iterate over a range of days', () => {
            const visited: string[] = [];
            DateIterator.forEach('2027-03-01', '2027-03-03', (date) => {
                visited.push(date);
            });
            expect(visited).toEqual(['2027-03-01', '2027-03-02', '2027-03-03']);
        });

        it('should provide the correct dayOfWeek for each date', () => {
            const days: number[] = [];
            // 2027-03-01 is a Monday (dayOfWeek = 1)
            DateIterator.forEach('2027-03-01', '2027-03-07', (_, dow) => {
                days.push(dow);
            });
            expect(days).toEqual([1, 2, 3, 4, 5, 6, 7]);
        });

        it('should iterate correctly across month boundary', () => {
            const visited: string[] = [];
            DateIterator.forEach('2027-01-30', '2027-02-02', (date) => {
                visited.push(date);
            });
            expect(visited).toEqual(['2027-01-30', '2027-01-31', '2027-02-01', '2027-02-02']);
        });
    });

    // ── generate ───────────────────────────────────────────────────────────
    describe('generate', () => {
        it('should return an array of date/dayOfWeek objects', () => {
            const result = DateIterator.generate('2027-03-01', '2027-03-03');
            expect(result).toHaveLength(3);
            expect(result[0]).toEqual({ date: '2027-03-01', dayOfWeek: 1 });
            expect(result[1]).toEqual({ date: '2027-03-02', dayOfWeek: 2 });
            expect(result[2]).toEqual({ date: '2027-03-03', dayOfWeek: 3 });
        });

        it('should return a single item for a single day', () => {
            const result = DateIterator.generate('2027-06-15', '2027-06-15');
            expect(result).toHaveLength(1);
            expect(result[0].date).toBe('2027-06-15');
        });
    });
});

/// <reference types="jest" />

import { availabilityValidator } from '../../../src/modules/availability/availability.validator';
import { ValidationDTOError } from '../../../src/shared/errors/validation.error';

// ─── Helper ───────────────────────────────────────────────────────────────────
const runMiddleware = async (
    middleware: (req: any, res: any, next: jest.Mock) => void | Promise<void>,
    req: Record<string, any>,
) => {
    const res = {} as any;
    const next = jest.fn();
    await middleware(req, res, next);
    return { req, res, next };
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('availability DTO validators', () => {
    // ── createWorkHour ────────────────────────────────────────────────────
    describe('createWorkHour', () => {
        it('should accept a valid working hours payload', async () => {
            const { next } = await runMiddleware(availabilityValidator.createWorkHour, {
                body: {
                    workingHours: [
                        { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '12:00' },
                    ],
                },
            });
            expect(next).toHaveBeenCalledWith();
        });

        it('should reject when workingHours is empty', async () => {
            const { next } = await runMiddleware(availabilityValidator.createWorkHour, {
                body: { workingHours: [] },
            });
            expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
        });

        it('should reject when startTime >= endTime', async () => {
            const { next } = await runMiddleware(availabilityValidator.createWorkHour, {
                body: {
                    workingHours: [
                        { dayOfWeek: 'MONDAY', startTime: '12:00', endTime: '08:00' },
                    ],
                },
            });
            expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
        });

        it('should reject an invalid dayOfWeek', async () => {
            const { next } = await runMiddleware(availabilityValidator.createWorkHour, {
                body: {
                    workingHours: [
                        { dayOfWeek: 'FUNDAY', startTime: '08:00', endTime: '12:00' },
                    ],
                },
            });
            expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
        });
    });

    // ── createDayOff ──────────────────────────────────────────────────────
    describe('createDayOff', () => {
        it('should accept a valid day-off payload', async () => {
            const { next } = await runMiddleware(availabilityValidator.createDayOff, {
                body: { date: '2026-07-04', reason: 'Holiday' },
            });
            expect(next).toHaveBeenCalledWith();
        });

        it('should accept a day-off without reason', async () => {
            const { next } = await runMiddleware(availabilityValidator.createDayOff, {
                body: { date: '2026-07-04' },
            });
            expect(next).toHaveBeenCalledWith();
        });

        it('should reject when date is missing', async () => {
            const { next } = await runMiddleware(availabilityValidator.createDayOff, {
                body: {},
            });
            expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
        });

        it('should reject an invalid date format', async () => {
            const { next } = await runMiddleware(availabilityValidator.createDayOff, {
                body: { date: 'not-a-date' },
            });
            expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
        });
    });

    // ── createPeriodOff ───────────────────────────────────────────────────
    describe('createPeriodOff', () => {
        it('should accept a valid period-off payload', async () => {
            const { next } = await runMiddleware(availabilityValidator.createPeriodOff, {
                body: {
                    startDate: '2026-08-01',
                    endDate: '2026-08-10',
                    reason: 'Vacation',
                },
            });
            expect(next).toHaveBeenCalledWith();
        });

        it('should reject when startDate >= endDate', async () => {
            const { next } = await runMiddleware(availabilityValidator.createPeriodOff, {
                body: {
                    startDate: '2026-08-10',
                    endDate: '2026-08-01',
                },
            });
            expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
        });

        it('should reject when endDate is missing', async () => {
            const { next } = await runMiddleware(availabilityValidator.createPeriodOff, {
                body: { startDate: '2026-08-01' },
            });
            expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
        });
    });

    // ── createTimeOff (discriminated union) ───────────────────────────────
    describe('createTimeOff', () => {
        it('should accept a valid SPECIFIC time-off payload', async () => {
            const { next } = await runMiddleware(availabilityValidator.createTimeOff, {
                body: {
                    type: 'SPECIFIC',
                    date: '2026-09-01',
                    startTime: '09:00',
                    endTime: '10:00',
                },
            });
            expect(next).toHaveBeenCalledWith();
        });

        it('should accept a valid RECURRING time-off payload', async () => {
            const { next } = await runMiddleware(availabilityValidator.createTimeOff, {
                body: {
                    type: 'RECURRING',
                    dayOfWeek: 'TUESDAY',
                    startTime: '14:00',
                    endTime: '16:00',
                },
            });
            expect(next).toHaveBeenCalledWith();
        });

        it('should reject SPECIFIC when startTime >= endTime', async () => {
            const { next } = await runMiddleware(availabilityValidator.createTimeOff, {
                body: {
                    type: 'SPECIFIC',
                    date: '2026-09-01',
                    startTime: '10:00',
                    endTime: '09:00',
                },
            });
            expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
        });

        it('should reject an unknown type', async () => {
            const { next } = await runMiddleware(availabilityValidator.createTimeOff, {
                body: { type: 'ALIEN', date: '2026-09-01', startTime: '09:00', endTime: '10:00' },
            });
            expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
        });
    });

    // ── id (params validator) ─────────────────────────────────────────────
    describe('id (params)', () => {
        it('should accept a valid numeric id in params', async () => {
            const { next } = await runMiddleware(availabilityValidator.id, {
                params: { id: '5' },
            });
            expect(next).toHaveBeenCalledWith();
        });

        it('should reject a non-numeric id', async () => {
            const { next } = await runMiddleware(availabilityValidator.id, {
                params: { id: 'abc' },
            });
            expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
        });

        it('should reject a negative id', async () => {
            const { next } = await runMiddleware(availabilityValidator.id, {
                params: { id: '-1' },
            });
            expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
        });
    });
});

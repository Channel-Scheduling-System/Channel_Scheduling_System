/// <reference types="jest" />

import { AvailabilityBusinessValidator } from '../../../src/modules/availability/validators/availability-business.validator';

function makeRepo(overrides: Record<string, jest.Mock> = {}) {
    return {
        findBlockedTimesByWorkerId: jest.fn().mockResolvedValue([]),
        ...overrides,
    } as any;
}

function makeUserService(exists = true) {
    return { existsByIdAndRole: jest.fn().mockResolvedValue(exists) } as any;
}

describe('AvailabilityBusinessValidator', () => {
    // ── ensureWorkerExists ─────────────────────────────────────────────────
    describe('ensureWorkerExists', () => {
        it('should resolve when worker exists', async () => {
            const validator = new AvailabilityBusinessValidator(makeRepo(), makeUserService(true));
            await expect(validator.ensureWorkerExists(7)).resolves.toBeUndefined();
        });

        it('should throw NotFoundError when worker does not exist', async () => {
            const validator = new AvailabilityBusinessValidator(makeRepo(), makeUserService(false));
            const { NotFoundError } = await import('../../../src/shared/errors/domain.error');
            await expect(validator.ensureWorkerExists(99)).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    // ── checkUniqueWorkingDays ─────────────────────────────────────────────
    describe('checkUniqueWorkingDays', () => {
        it('should pass when all days are unique', () => {
            const validator = new AvailabilityBusinessValidator(makeRepo(), makeUserService());
            expect(() =>
                validator.checkUniqueWorkingDays([
                    { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '12:00' } as any,
                    { dayOfWeek: 'TUESDAY', startTime: '08:00', endTime: '12:00' } as any,
                ]),
            ).not.toThrow();
        });

        it('should throw ConflictError when there are duplicate days', async () => {
            const validator = new AvailabilityBusinessValidator(makeRepo(), makeUserService());
            const { ConflictError } = await import('../../../src/shared/errors/domain.error');
            expect(() =>
                validator.checkUniqueWorkingDays([
                    { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '12:00' } as any,
                    { dayOfWeek: 'MONDAY', startTime: '13:00', endTime: '17:00' } as any,
                ]),
            ).toThrow(ConflictError);
        });
    });

    // ── checkFutureDate ────────────────────────────────────────────────────
    describe('checkFutureDate', () => {
        it('should pass for a future date', () => {
            const validator = new AvailabilityBusinessValidator(makeRepo(), makeUserService());
            expect(() => validator.checkFutureDate('2099-01-01')).not.toThrow();
        });

        it('should throw ConflictError for a past date', async () => {
            const validator = new AvailabilityBusinessValidator(makeRepo(), makeUserService());
            const { ConflictError } = await import('../../../src/shared/errors/domain.error');
            expect(() => validator.checkFutureDate('2020-01-01')).toThrow(ConflictError);
        });
    });

    // ── checkOverlapping ───────────────────────────────────────────────────
    describe('checkOverlapping', () => {
        it('should resolve when there are no existing blocks', async () => {
            const repo = makeRepo({ findBlockedTimesByWorkerId: jest.fn().mockResolvedValue([]) });
            const validator = new AvailabilityBusinessValidator(repo, makeUserService());

            await expect(
                validator.checkOverlapping({
                    workerId: 7,
                    type: 'DAY',
                    startDate: '2027-06-10T00:00:00Z',
                }),
            ).resolves.toBeUndefined();
        });

        it('should throw ConflictError when new block overlaps existing', async () => {
            const existing = {
                id: 1,
                workerId: 7,
                type: 'DAY',
                startDate: new Date('2027-06-10T00:00:00Z'),
                endDate: null,
                startTime: null,
                endTime: null,
                dayOfWeek: null,
                reason: null,
                createdAt: new Date(),
            };
            const repo = makeRepo({
                findBlockedTimesByWorkerId: jest.fn().mockResolvedValue([existing]),
            });
            const validator = new AvailabilityBusinessValidator(repo, makeUserService());
            const { ConflictError } = await import('../../../src/shared/errors/domain.error');

            await expect(
                validator.checkOverlapping({
                    workerId: 7,
                    type: 'DAY',
                    startDate: '2027-06-10T00:00:00Z',
                }),
            ).rejects.toBeInstanceOf(ConflictError);
        });
    });

    // ── checkOverlappingRecurring ──────────────────────────────────────────
    describe('checkOverlappingRecurring', () => {
        it('should resolve when there are no existing blocks', async () => {
            const validator = new AvailabilityBusinessValidator(makeRepo(), makeUserService());

            await expect(
                validator.checkOverlappingRecurring({
                    workerId: 7,
                    type: 'RECURRING',
                    dayOfWeek: 'MONDAY',
                    startTime: '09:00',
                    endTime: '11:00',
                }),
            ).resolves.toBeUndefined();
        });

        it('should throw ConflictError when recurring block overlaps existing', async () => {
            const existing = {
                id: 1,
                workerId: 7,
                type: 'HOUR',
                startDate: new Date('1900-01-01T00:00:00Z'),
                endDate: null,
                startTime: new Date('1900-01-01T09:00:00Z'),
                endTime: new Date('1900-01-01T11:00:00Z'),
                dayOfWeek: 1, // MONDAY
                reason: null,
                createdAt: new Date(),
            };
            const repo = makeRepo({
                findBlockedTimesByWorkerId: jest.fn().mockResolvedValue([existing]),
            });
            const validator = new AvailabilityBusinessValidator(repo, makeUserService());
            const { ConflictError } = await import('../../../src/shared/errors/domain.error');

            await expect(
                validator.checkOverlappingRecurring({
                    workerId: 7,
                    type: 'RECURRING',
                    dayOfWeek: 'MONDAY',
                    startTime: '10:00',
                    endTime: '12:00',
                }),
            ).rejects.toBeInstanceOf(ConflictError);
        });
    });

    // ── validateOwnership ──────────────────────────────────────────────────
    describe('validateOwnership', () => {
        it('should pass when block owner matches auth', () => {
            const validator = new AvailabilityBusinessValidator(makeRepo(), makeUserService());
            expect(() =>
                validator.validateOwnership(
                    { id: 5, workerId: 7 } as any,
                    { id: 7, role: 'WORKER' },
                ),
            ).not.toThrow();
        });

        it('should throw ForbiddenError when ownership does not match', async () => {
            const validator = new AvailabilityBusinessValidator(makeRepo(), makeUserService());
            const { ForbiddenError } = await import('../../../src/shared/errors/domain.error');
            expect(() =>
                validator.validateOwnership(
                    { id: 5, workerId: 10 } as any,
                    { id: 7, role: 'WORKER' },
                ),
            ).toThrow(ForbiddenError);
        });
    });

    // ── validateCanView ────────────────────────────────────────────────────
    describe('validateCanView', () => {
        it('should pass when workerId matches auth id', () => {
            const validator = new AvailabilityBusinessValidator(makeRepo(), makeUserService());
            expect(() =>
                validator.validateCanView(7, { id: 7, role: 'WORKER' }),
            ).not.toThrow();
        });

        it('should throw ForbiddenError when workerId does not match auth id', async () => {
            const validator = new AvailabilityBusinessValidator(makeRepo(), makeUserService());
            const { ForbiddenError } = await import('../../../src/shared/errors/domain.error');
            expect(() =>
                validator.validateCanView(10, { id: 7, role: 'WORKER' }),
            ).toThrow(ForbiddenError);
        });
    });
});

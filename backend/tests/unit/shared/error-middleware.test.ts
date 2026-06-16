/// <reference types="jest" />

import { z } from 'zod';
import { handleErrorMiddleware } from '../../../src/shared/middlewares/error.middleware';
import { NotFoundError, ConflictError } from '../../../src/shared/errors/domain.error';
import { ValidationDTOError } from '../../../src/shared/errors/validation.error';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildRes() {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    return { res: { status, json, headersSent: false } as any, status, json };
}

function runMiddleware(error: unknown) {
    const { res, status, json } = buildRes();
    const next = jest.fn();
    handleErrorMiddleware(error, {} as any, res, next);
    return { status, json, next };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('handleErrorMiddleware', () => {
    it('should call next(error) when headers are already sent', () => {
        const next = jest.fn();
        const res = { headersSent: true } as any;
        const err = new Error('late error');
        handleErrorMiddleware(err, {} as any, res, next);
        expect(next).toHaveBeenCalledWith(err);
    });

    it('should return 400 for a ZodError', () => {
        const zodErr = new z.ZodError([]);
        const { status, json } = runMiddleware(zodErr);
        expect(status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith(
            expect.objectContaining({ code: 'VALIDATION_ERROR' }),
        );
    });

    it('should return the correct status for a ValidationError', () => {
        const err = new ValidationDTOError({ field: 'required' });
        const { status, json } = runMiddleware(err);
        expect(status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith(
            expect.objectContaining({ code: 'VALIDATION_DTO_ERROR' }),
        );
    });

    it('should return the correct status for a DomainError subclass (NotFoundError)', () => {
        const err = new NotFoundError('Resource missing');
        const { status, json } = runMiddleware(err);
        expect(status).toHaveBeenCalledWith(404);
        expect(json).toHaveBeenCalledWith(
            expect.objectContaining({ code: 'NOT_FOUND_ERROR' }),
        );
    });

    it('should return 409 for ConflictError', () => {
        const err = new ConflictError('Duplicate');
        const { status } = runMiddleware(err);
        expect(status).toHaveBeenCalledWith(409);
    });

    it('should return 404 for PrismaClientKnownRequestError P2025', () => {
        const prismaErr = { name: 'PrismaClientKnownRequestError', code: 'P2025', meta: {} };
        const { status } = runMiddleware(prismaErr);
        expect(status).toHaveBeenCalledWith(404);
    });

    it('should return 404 for PrismaClientKnownRequestError P2003', () => {
        const prismaErr = { name: 'PrismaClientKnownRequestError', code: 'P2003', meta: {} };
        const { status } = runMiddleware(prismaErr);
        expect(status).toHaveBeenCalledWith(404);
    });

    it('should return 409 for PrismaClientKnownRequestError P2002', () => {
        const prismaErr = { name: 'PrismaClientKnownRequestError', code: 'P2002', meta: {} };
        const { status } = runMiddleware(prismaErr);
        expect(status).toHaveBeenCalledWith(409);
    });

    it('should return 500 for unknown Prisma error codes', () => {
        const prismaErr = { name: 'PrismaClientKnownRequestError', code: 'P9999', meta: {} };
        const { status } = runMiddleware(prismaErr);
        expect(status).toHaveBeenCalledWith(500);
    });

    it('should return 500 for a generic Error', () => {
        const err = new Error('Unexpected failure');
        const { status } = runMiddleware(err);
        expect(status).toHaveBeenCalledWith(500);
    });

    it('should return 500 for an unknown error value (fallback)', () => {
        const { status } = runMiddleware('some string error');
        expect(status).toHaveBeenCalledWith(500);
    });
});

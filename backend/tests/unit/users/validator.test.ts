/// <reference types="jest" />

import { userValidator } from '../../../src/modules/users/user.validator';
import { ValidationDTOError } from '../../../src/shared/errors/validation.error';

describe('User DTO validators', () => {
    const runMiddleware = async (
        middleware: (req: any, res: any, next: jest.Mock) => void | Promise<void>,
        req: Record<string, any>,
    ) => {
        const res = {} as any;
        const next = jest.fn();

        await middleware(req, res, next);

        return { req, res, next };
    };

    it('should accept a correct create payload', async () => {
        const { next } = await runMiddleware(userValidator.create, {
            body: {
                alias: 'johangil',
                firstName: 'Johan',
                lastName: 'Gil',
                phone: '3001234567',
                email: 'johan@test.com',
                password: 'Password123!',
                role: 'CLIENT',
            },
        });

        expect(next).toHaveBeenCalledWith();
    });

    it('should reject create payloads with missing password', async () => {
        const { next } = await runMiddleware(userValidator.create, {
            body: {
                alias: 'johangil',
                firstName: 'Johan',
                lastName: 'Gil',
                phone: '3001234567',
                email: 'johan@test.com',
                role: 'CLIENT',
            },
        });

        expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
    });

    it('should accept a valid first admin payload', async () => {
        const { next } = await runMiddleware(userValidator.createFirstAdmin, {
            body: {
                alias: 'adminone',
                firstName: 'Admin',
                lastName: 'One',
                phone: '3000000001',
                email: 'admin@test.com',
                password: 'Password123!',
                secretCode: '1234567890',
            },
        });

        expect(next).toHaveBeenCalledWith();
    });

    it('should reject first admin payload without secret code', async () => {
        const { next } = await runMiddleware(userValidator.createFirstAdmin, {
            body: {
                alias: 'adminone',
                firstName: 'Admin',
                lastName: 'One',
                phone: '3000000001',
                email: 'admin@test.com',
                password: 'Password123!',
            },
        });

        expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
    });

    it('should accept a partial update payload', async () => {
        const { next } = await runMiddleware(userValidator.update, {
            body: {
                firstName: 'Carlos',
                lastName: 'Gil',
            },
        });

        expect(next).toHaveBeenCalledWith();
    });

    it('should reject update payloads with read only fields', async () => {
        const { next } = await runMiddleware(userValidator.update, {
            body: {
                id: 1,
                role: 'ADMIN',
            },
        });

        expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
    });

    it('should accept a valid password update payload', async () => {
        const { next } = await runMiddleware(userValidator.updatePassword, {
            body: {
                password: 'OldPass123!',
                newPassword: 'NewPass123!',
            },
        });

        expect(next).toHaveBeenCalledWith();
    });

    it('should reject password updates with invalid password', async () => {
        const { next } = await runMiddleware(userValidator.updatePassword, {
            body: {
                password: 'old',
                newPassword: 'NewPass123!',
            },
        });

        expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
    });

    it('should accept query filters with role and identifier', async () => {
        const { next, req } = await runMiddleware(userValidator.filters, {
            query: {
                role: 'ADMIN',
                identifier: 'johan',
            },
        });

        expect(req.query.role).toEqual(['ADMIN']);
        expect(next).toHaveBeenCalledWith();
    });

    it('should accept pagination and filters in query params', async () => {
        const { next, req } = await runMiddleware(userValidator.filters, {
            query: {
                page: '2',
                limit: '10',
                role: ['ADMIN', 'WORKER'],
                isActive: 'true',
            },
        });

        expect(req.query.page).toBe(2);
        expect(req.query.limit).toBe(10);
        expect(next).toHaveBeenCalledWith();
    });
});

/// <reference types="jest" />

import { authValidator } from '../../../src/modules/auth/auth.validator';
import { ValidationDTOError } from '../../../src/shared/errors/validation.error';

describe('Auth DTO validators', () => {
    const runMiddleware = async (
        middleware: (req: any, res: any, next: jest.Mock) => void | Promise<void>,
        req: Record<string, any>,
    ) => {
        const res = {} as any;
        const next = jest.fn();

        await middleware(req, res, next);

        return { req, res, next };
    };

    it('should accept a correct register payload', async () => {
        const { next } = await runMiddleware(authValidator.register, {
            body: {
                firstName: 'Johan',
                lastName: 'Gil',
                alias: 'johangil',
                email: 'johan@test.com',
                phone: '3001234567',
                password: 'Password123!',
            },
        });

        expect(next).toHaveBeenCalledWith();
    });

    it('should reject register payloads with unknown fields', async () => {
        const { next } = await runMiddleware(authValidator.register, {
            body: {
                firstName: 'Johan',
                lastName: 'Gil',
                alias: 'johangil',
                email: 'johan@test.com',
                password: 'Password123!',
                extraField: 'not-allowed',
            },
        });

        expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
    });

    it('should reject login without identifier', async () => {
        const { next } = await runMiddleware(authValidator.login, {
            body: {
                password: 'Password123!',
            },
        });

        expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
    });

    it('should reject login with invalid identifier', async () => {
        const { next } = await runMiddleware(authValidator.login, {
            body: {
                identifier: 'inv@lid',
                password: 'Password123!',
            },
        });

        expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
    });

    it('should reject refresh token when cookie is missing', async () => {
        const { next } = await runMiddleware(authValidator.refreshToken, {
            cookies: {},
        });

        expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
    });

    it('should reject refresh token with invalid format', async () => {
        const { next } = await runMiddleware(authValidator.refreshToken, {
            cookies: {
                refreshToken: 'invalid-token',
            },
        });

        expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
    });

    it('should accept a valid refresh token', async () => {
        const token =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

        const { next, req } = await runMiddleware(authValidator.refreshToken, {
            cookies: {
                refreshToken: token,
            },
        });

        expect(req.cookies.refreshToken).toBe(token);
        expect(next).toHaveBeenCalledWith();
    });
});

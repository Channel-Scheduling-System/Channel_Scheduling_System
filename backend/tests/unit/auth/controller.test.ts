/// <reference types="jest" />

jest.mock('../../../src/config/env', () => ({
    env: {
        nodeEnv: 'test',
    },
}));

import { AuthController } from '../../../src/modules/auth/auth.controller';

describe('AuthController', () => {
    it('should return 200 and payload on login success', async () => {
        const authService = {
            login: jest.fn().mockResolvedValue({
                user: {
                    id: 1,
                    name: 'Johan Gil',
                    alias: 'johangil',
                    role: 'ADMIN',
                },
                tokens: {
                    accessToken: 'token-123',
                    refreshToken: 'refresh-token-123',
                },
            }),
            register: jest.fn(),
        };
        const controller = new AuthController(authService as any);

        const req = {
            body: {
                identifier: 'johangil',
                password: 'Password123',
            },
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        } as any;
        const next = jest.fn();

        await controller.login(req, res, next);

        expect(res.cookie).toHaveBeenCalledWith(
            'refreshToken',
            'refresh-token-123',
            expect.objectContaining({ httpOnly: true, sameSite: 'strict' }),
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Login exitoso',
            data: {
                user: {
                    id: 1,
                    name: 'Johan Gil',
                    alias: 'johangil',
                    role: 'ADMIN',
                },
                token: 'token-123',
            },
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error on login failure', async () => {
        const error = new Error('boom');
        const authService = {
            login: jest.fn().mockRejectedValue(error),
            register: jest.fn(),
        };
        const controller = new AuthController(authService as any);

        const req = { body: {} } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        } as any;
        const next = jest.fn();

        await controller.login(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    it('should return 201 and payload on register success', async () => {
        const authService = {
            login: jest.fn(),
            register: jest.fn().mockResolvedValue({
                user: {
                    id: 1,
                    name: 'Johan Gil',
                    alias: 'johangil',
                    role: 'ADMIN',
                },
                tokens: {
                    accessToken: 'token-456',
                    refreshToken: 'refresh-token-456',
                },
            }),
        };
        const controller = new AuthController(authService as any);

        const req = {
            body: {
                firstName: 'Johan',
                lastName: 'Gil',
                alias: 'johangil',
                email: 'johan@test.com',
                password: 'Password123',
                role: 'ADMIN',
            },
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        } as any;
        const next = jest.fn();

        await controller.register(req, res, next);

        expect(res.cookie).toHaveBeenCalledWith(
            'refreshToken',
            'refresh-token-456',
            expect.objectContaining({ httpOnly: true, sameSite: 'strict' }),
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Usuario registrado exitosamente',
            data: {
                user: {
                    id: 1,
                    name: 'Johan Gil',
                    alias: 'johangil',
                    role: 'ADMIN',
                },
                token: 'token-456',
            },
        });
        expect(next).not.toHaveBeenCalled();
    });
});

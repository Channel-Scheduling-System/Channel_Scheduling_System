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
            expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
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
            expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
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

    it('should return 200 and payload on refresh success', async () => {
        const authService = {
            login: jest.fn(),
            register: jest.fn(),
            refresh: jest.fn().mockResolvedValue({
                user: {
                    id: 1,
                    name: 'Johan Gil',
                    alias: 'johangil',
                    role: 'ADMIN',
                },
                tokens: {
                    accessToken: 'token-789',
                    refreshToken: 'refresh-token-789',
                },
            }),
            logout: jest.fn(),
            checkAdminExists: jest.fn(),
        };
        const controller = new AuthController(authService as any);

        const req = {
            cookies: {
                refreshToken: 'refresh-token-123',
            },
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            clearCookie: jest.fn(),
        } as any;
        const next = jest.fn();

        await controller.refresh(req, res, next);

        expect(res.cookie).toHaveBeenCalledWith(
            'refreshToken',
            'refresh-token-789',
            expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Autenticación exitosa',
            data: {
                user: {
                    id: 1,
                    name: 'Johan Gil',
                    alias: 'johangil',
                    role: 'ADMIN',
                },
                token: 'token-789',
            },
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 200 and clear cookie on logout success', async () => {
        const authService = {
            login: jest.fn(),
            register: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn().mockResolvedValue(undefined),
            checkAdminExists: jest.fn(),
        };
        const controller = new AuthController(authService as any);

        const req = {
            cookies: {
                refreshToken: 'refresh-token-123',
            },
            user: {
                sub: 1,
            },
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            clearCookie: jest.fn(),
        } as any;
        const next = jest.fn();

        await controller.logout(req, res, next);

        expect(authService.logout).toHaveBeenCalledWith({
            refreshToken: 'refresh-token-123',
            userId: 1,
        });
        expect(res.clearCookie).toHaveBeenCalledWith(
            'refreshToken',
            expect.objectContaining({
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
            }),
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Sesión cerrada exitosamente',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 200 and admin existence status', async () => {
        const authService = {
            login: jest.fn(),
            register: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
            checkAdminExists: jest.fn().mockResolvedValue(true),
        };
        const controller = new AuthController(authService as any);

        const req = {} as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            clearCookie: jest.fn(),
        } as any;
        const next = jest.fn();

        await controller.checkAdminExists(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Hay un administrador registrado',
            data: {
                exists: true,
            },
        });
        expect(next).not.toHaveBeenCalled();
    });
});

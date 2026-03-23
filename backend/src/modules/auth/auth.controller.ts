import { NextFunction, Request, Response } from 'express';
import { env } from '#/config/env.js';
import { IAuthService } from './auth.service.js';
import { mapToAuthResultResponse } from './auth.mapper.js';

// ONE_DAY_IN_MS = ms * seg * min * hr
const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;
const REFRESH_TOKEN_DAYS = 7;

export class AuthController {
    constructor(private readonly authService: IAuthService) {}

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.authService.register(req.body);
            this.setRefreshTokenCookie(res, data.tokens.refreshToken);
            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                data: mapToAuthResultResponse(data),
            });
        } catch (err) {
            next(err);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.authService.login(req.body);
            this.setRefreshTokenCookie(res, data.tokens.refreshToken);
            res.status(200).json({
                message: 'Login exitoso',
                data: mapToAuthResultResponse(data),
            });
        } catch (err) {
            next(err);
        }
    };

    refresh = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies?.refreshToken;
            const data = await this.authService.refresh({ refreshToken });

            this.setRefreshTokenCookie(res, data.tokens.refreshToken);
            res.status(200).json({
                message: 'Autenticación exitosa',
                data: mapToAuthResultResponse(data),
            });
        } catch (err) {
            next(err);
        }
    };

    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies?.refreshToken;
            const userId = req.user?.sub;

            if (refreshToken) {
                await this.authService.logout({ refreshToken, userId });
            }

            this.clearRefreshTokenCookie(res);
            res.status(200).json({
                message: 'Sesión cerrada exitosamente',
            });
        } catch (err) {
            next(err);
        }
    };

    private setRefreshTokenCookie = (res: Response, refreshToken: string) => {
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: env.nodeEnv === 'production',
            sameSite: 'strict',
            maxAge: ONE_DAY_IN_MS * REFRESH_TOKEN_DAYS,
            path: '/',
        });
    };

    private clearRefreshTokenCookie = (res: Response) => {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: env.nodeEnv === 'production',
            sameSite: 'strict',
            path: '/',
        });
    };
}

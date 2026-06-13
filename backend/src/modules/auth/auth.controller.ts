import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IAuthService } from './auth.service.js';
import { mapToAuthResultResponse } from './auth.mapper.js';
import {
    REFRESH_COOKIE_NAME,
    REFRESH_COOKIE_OPTIONS,
} from '../../shared/constants/cookies.js';

export class AuthController {
    constructor(private readonly authService: IAuthService) {}

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.authService.register(req.body);
            this.setRefreshTokenCookie(res, data.tokens.refreshToken);
            res.status(StatusCodes.CREATED).json({
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
            res.status(StatusCodes.OK).json({
                message: 'Login exitoso',
                data: mapToAuthResultResponse(data),
            });
        } catch (err) {
            next(err);
        }
    };

    refresh = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
            const data = await this.authService.refresh({ refreshToken });

            this.setRefreshTokenCookie(res, data.tokens.refreshToken);
            res.status(StatusCodes.OK).json({
                message: 'Autenticación exitosa',
                data: mapToAuthResultResponse(data),
            });
        } catch (err) {
            next(err);
        }
    };

    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
            const userId = req.user?.sub as unknown as number;

            if (refreshToken)
                await this.authService.logout({ refreshToken, userId });

            this.clearRefreshTokenCookie(res);
            res.status(StatusCodes.OK).json({
                message: 'Sesión cerrada exitosamente',
            });
        } catch (err) {
            next(err);
        }
    };

    requestPasswordReset = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            await this.authService.requestPasswordReset(req.body.email);
            res.status(StatusCodes.OK).json({
                message:
                    'Si el correo está registrado, recibirá un código de recuperación',
            });
        } catch (err) {
            next(err);
        }
    };

    verifyResetCode = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const resetToken = await this.authService.verifyResetCode(req.body);
            res.status(StatusCodes.OK).json({
                message: 'Código verificado correctamente',
                resetToken,
            });
        } catch (err) {
            next(err);
        }
    };

    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.user?.sub as unknown as number;
            await this.authService.resetPassword(id, req.body.newPassword);
            res.json({ message: 'Contraseña actualizada con éxito' });
        } catch (err) {
            next(err);
        }
    };

    checkAdminExists = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const exists = await this.authService.checkAdminExists();
            res.status(StatusCodes.OK).json({
                message: exists
                    ? 'Hay un administrador registrado'
                    : 'No hay un administrador registrado',
                data: { exists },
            });
        } catch (err) {
            next(err);
        }
    };

    private readonly setRefreshTokenCookie = (res: Response, token: string) => {
        res.cookie(REFRESH_COOKIE_NAME, token, REFRESH_COOKIE_OPTIONS);
    };

    private readonly clearRefreshTokenCookie = (res: Response) => {
        const { maxAge: _maxAge, ...cookieOptions } = REFRESH_COOKIE_OPTIONS;
        res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions);
    };
}

import { NextFunction, Request, Response } from 'express';
import { IAuthService } from './auth.service.js';
import { LoginInput, RegisterInput } from './auth.types.js';

export class AuthController {
    constructor(private readonly authService: IAuthService) {}

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.authService.login(req.body as LoginInput);
            res.status(200).json({
                success: true,
                message: 'Login exitoso',
                data,
            });
        } catch (err) {
            next(err);
        }
    };

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.authService.register(
                req.body as RegisterInput,
            );
            res.status(200).json({
                success: true,
                message: 'Registro exitoso',
                data,
            });
        } catch (err) {
            next(err);
        }
    };
}

import { NextFunction, Request, Response } from 'express';
import type { SystemRole } from './user.types.js';
import { IUserService } from './user.service.js';

export class UserController {
    constructor(private readonly userService: IUserService) {}

    add = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authUserRole = req.user?.role as SystemRole;
            await this.userService.add(req.body, authUserRole);
            return res.status(201).json({
                message: 'Usuario registrado exitosamente',
            });
        } catch (error) {
            next(error);
        }
    };

    addFirstAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.userService.addFirstAdmin(req.body);
            res.status(201).json({
                message: 'Administrador registrado exitosamente',
                data,
            });
        } catch (err) {
            next(err);
        }
    };
}

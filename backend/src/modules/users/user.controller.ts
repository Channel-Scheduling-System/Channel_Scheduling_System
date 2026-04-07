import { NextFunction, Request, Response } from 'express';
import type { SystemRole } from './user.types.js';
import { IUserService } from './user.service.js';
import { mapToUserFilters } from './user.mapper.js';

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

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as unknown as number;
            const authRole = req.user?.role as SystemRole;
            const authId = req.user?.sub as unknown as number;
            const data = await this.userService.getById(id, {
                role: authRole,
                id: authId,
            });
            return res.status(200).json({
                message: 'Usuario recuperado exitosamente',
                data,
            });
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const filters = mapToUserFilters(req.query);
            const authRole = req.user?.role as SystemRole;
            const authId = req.user?.sub as unknown as number;
            const data = await this.userService.getAll(filters, {
                role: authRole,
                id: authId,
            });
            return res.status(200).json({
                message: 'Usuarios recuperados exitosamente',
                data,
                // TODO: meta: total, limit, page, totalPages
            });
        } catch (error) {
            next(error);
        }
    };
}

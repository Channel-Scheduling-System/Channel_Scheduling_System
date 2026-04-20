import { NextFunction, Request, Response } from 'express';
import { IUserService } from './user.service.js';
import { mapToUserFilters, mapToUserPagination } from './user.mapper.js';
import {
    extractAuthContext,
    extractRequestContextWithId,
} from '../../shared/utils/request-parser.util.js';

export class UserController {
    constructor(private readonly userService: IUserService) {}

    add = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const auth = extractAuthContext(req);
            await this.userService.add(req.body, auth);
            return res.status(201).json({
                message: 'Usuario registrado exitosamente',
            });
        } catch (error) {
            next(error);
        }
    };

    addFirstAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.userService.addFirstAdmin(req.body);
            res.status(201).json({
                message: 'Administrador registrado exitosamente',
            });
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, authRole, authId } = extractRequestContextWithId(req);
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
            const pagination = mapToUserPagination(req.query);
            const filters = mapToUserFilters(req.query);
            const { role } = extractAuthContext(req);
            const result = await this.userService.getAll(
                pagination,
                filters,
                role,
            );
            return res.status(200).json({
                message: 'Usuarios recuperados exitosamente',
                data: result.data,
                meta: result.meta,
            });
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, authRole, authId } = extractRequestContextWithId(req);
            await this.userService.update(
                { id, ...req.body },
                { role: authRole, id: authId },
            );
            return res.status(200).json({
                message: 'Usuario actualizado exitosamente',
            });
        } catch (error) {
            next(error);
        }
    };

    updatePassword = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const { id, authRole, authId } = extractRequestContextWithId(req);
            await this.userService.updatePassword(
                { id, ...req.body },
                { role: authRole, id: authId },
            );
            return res.status(200).json({
                message: 'Su Contraseña se ha actualizado exitosamente',
            });
        } catch (error) {
            next(error);
        }
    };

    updateState = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, authRole, authId } = extractRequestContextWithId(req);
            const state = await this.userService.updateState(
                { id, ...req.body },
                { role: authRole, id: authId },
            );
            return res.status(200).json({
                message: `Usuario ${state ? 'activado' : 'desactivado'} exitosamente`,
            });
        } catch (error) {
            next(error);
        }
    };
}

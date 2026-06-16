import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IServiceService } from './service.service.js';
import { mapToServiceFilters } from './service.mapper.js';
import { extractRequestContextWithId } from '../../shared/utils/request-parser.util.js';

export class ServiceController {
    constructor(private readonly serviceService: IServiceService) {}

    add = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.serviceService.add(req.body);
            return res.status(StatusCodes.CREATED).json({
                message: 'Servicio creado exitosamente',
            });
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as unknown as number;
            const data = await this.serviceService.getById(id);
            return res.status(StatusCodes.OK).json({
                message: 'Servicio recuperado exitosamente',
                data,
            });
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const filters = mapToServiceFilters(req.query);
            const data = await this.serviceService.getAll(filters);
            return res.status(StatusCodes.OK).json({
                message: 'Servicios recuperados exitosamente',
                data,
            });
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as unknown as number;
            await this.serviceService.update({ id, ...req.body });
            return res.status(StatusCodes.OK).json({
                message: 'Servicio actualizado exitosamente',
            });
        } catch (error) {
            next(error);
        }
    };

    updateState = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, auth } = extractRequestContextWithId(req);
            const state = await this.serviceService.updateState(
                { id, ...req.body },
                auth,
            );
            return res.status(StatusCodes.OK).json({
                message: `Servicio ${state ? 'activado' : 'desactivado'} exitosamente`,
            });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as unknown as number;
            await this.serviceService.delete(id);
            return res
                .status(StatusCodes.OK)
                .json({ message: 'Servicio eliminado exitosamente' });
        } catch (error) {
            next(error);
        }
    };
}

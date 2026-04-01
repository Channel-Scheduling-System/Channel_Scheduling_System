import { NextFunction, Request, Response } from 'express';
import { IServiceService } from './service.service.js';
import { mapToServiceFilters } from './service.mapper.js';

export class ServiceController {
    constructor(private readonly serviceService: IServiceService) {}

    add = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.serviceService.add(req.body);
            return res.status(201).json({
                message: 'Servicio creado exitosamente',
                data,
            });
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as unknown as number;
            const data = await this.serviceService.getById(id);
            return res.status(200).json({
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
            return res.status(200).json({
                message: 'Servicio actualizado exitosamente',
                data,
            });
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.serviceService.update(req.body);
            return res.status(200).json({
                message: 'Servicio actualizado exitosamente',
                data,
            });
        } catch (error) {
            next(error);
        }
    };
}

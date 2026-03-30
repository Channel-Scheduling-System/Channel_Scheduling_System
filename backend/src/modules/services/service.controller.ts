import { NextFunction, Request, Response } from 'express';
import { IServiceService } from './service.service.js';

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

}

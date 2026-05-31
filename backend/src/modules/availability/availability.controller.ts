import { NextFunction, Request, Response } from 'express';
import { IAvailabilityService } from './availability.service.js';
import { extractRequestContextWithId } from '../../shared/utils/request-parser.util.js';
import {
    mapToAvailabilityClientFilter,
    mapToAvailabilityWorkerFilter,
} from './availability.mapper.js';

export class AvailabilityController {
    constructor(private readonly availabilityService: IAvailabilityService) {}

    addWorkingHours = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const id = req.params.id as unknown as number;
            await this.availabilityService.addWorkingHours({
                workerId: id,
                workingHours: req.body.workingHours,
            });
            return res.status(201).json({
                message: 'Horario establecido correctamente',
            });
        } catch (error) {
            next(error);
        }
    };

    addTimeOff = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const workerId = req.params.id as unknown as number;
            await this.availabilityService.addTimeOff({
                workerId,
                ...req.body,
            });
            return res.status(201).json({
                message: 'Tiempo bloqueado correctamente',
            });
        } catch (error) {
            next(error);
        }
    };

    addDayOff = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const workerId = req.params.id as unknown as number;
            await this.availabilityService.addDayOff({ workerId, ...req.body });
            return res.status(201).json({
                message: 'Dia bloqueado correctamente',
            });
        } catch (error) {
            next(error);
        }
    };

    addPeriodOff = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const workerId = req.params.id as unknown as number;
            await this.availabilityService.addPeriodOff({
                workerId,
                ...req.body,
            });
            return res.status(201).json({
                message: 'Periodo bloqueado correctamente',
            });
        } catch (error) {
            next(error);
        }
    };

    getBasicAvailability = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const workerId = req.params.id as unknown as number;
            const filters = mapToAvailabilityClientFilter(workerId, req.query);
            const data =
                await this.availabilityService.getBasicAvailability(filters);
            return res.status(200).json({
                message: 'Disponibilidad recuperada correctamente',
                data,
            });
        } catch (error) {
            next(error);
        }
    };

    getFullAvailability = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const { id, auth } = extractRequestContextWithId(req);
            const filters = mapToAvailabilityWorkerFilter(id, req.query);
            const data = await this.availabilityService.getFullAvailability(
                filters,
                auth,
            );
            return res.status(200).json({
                message: 'Disponibilidad recuperada correctamente',
                data,
            });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, auth } = extractRequestContextWithId(req);
            await this.availabilityService.delete(id, auth);
            return res.status(200).json({
                message: 'Bloque de tiempo desbloqueado correctamente',
            });
        } catch (error) {
            next(error);
        }
    };
}

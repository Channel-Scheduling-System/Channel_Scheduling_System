import { NextFunction, Request, Response } from 'express';
import { IAvailabilityService } from './availability.service.js';
import { extractRequestContextWithId } from '../../shared/utils/request-parser.util.js';

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

    addDayOff = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const workerId = req.params.id as unknown as number;
            await this.availabilityService.addDayOff({ workerId, ...req.body });
            return res.status(201).json({
                message: 'Dia libre establecido correctamente',
            });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, authId, authRole } = extractRequestContextWithId(req);
            await this.availabilityService.delete(id, {
                id: authId,
                role: authRole,
            });
            return res.status(200).json({
                message: 'Dia libre eliminado correctamente',
            });
        } catch (error) {
            next(error);
        }
    };
}

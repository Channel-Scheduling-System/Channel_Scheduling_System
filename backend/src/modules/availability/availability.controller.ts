import { NextFunction, Request, Response } from 'express';
import { IAvailabilityService } from './availability.service.js';

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
}

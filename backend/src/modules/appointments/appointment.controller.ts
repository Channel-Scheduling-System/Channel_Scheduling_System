import { NextFunction, Request, Response } from 'express';
import { IAppointmentService } from './appointment.service.js';
import {
    extractAuthContext,
    extractRequestContextWithId,
} from '../../shared/utils/request-parser.util.js';

export class AppointmentController {
    constructor(private readonly appointmentService: IAppointmentService) {}

    verifyOverlap = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { message, ...data } =
                await this.appointmentService.verifyOverlap(req.body);
            return res.status(200).json({ data, message });
        } catch (error) {
            next(error);
        }
    };

    add = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const auth = extractAuthContext(req);
            await this.appointmentService.add(req.body, auth);
            return res.status(201).json({
                message:
                    auth.role === 'WORKER'
                        ? 'Cita creada correctamente'
                        : 'Cita solicitada correctamente',
            });
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, auth } = extractRequestContextWithId(req);
            const appointment = await this.appointmentService.getById(id, auth);
            return res.status(200).json({ data: appointment });
        } catch (error) {
            next(error);
        }
    };
}

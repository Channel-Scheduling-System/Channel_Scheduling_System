import { NextFunction, Request, Response } from 'express';
import { IAppointmentService } from './appointment.service.js';
import {
    extractAuthContext,
    extractRequestContextWithId,
} from '../../shared/utils/request-parser.util.js';
import {
    mapToAppointmentCalendarFilter,
    mapToAppointmentHistoryFilter,
} from './appointment.mapper.js';

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
            const data = await this.appointmentService.getById(id, auth);
            return res.status(200).json({
                message: 'Cita obtenida correctamente',
                data,
            });
        } catch (error) {
            next(error);
        }
    };

    getHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const filters = mapToAppointmentHistoryFilter(req.query);
            const auth = extractAuthContext(req);
            const data = await this.appointmentService.getHistory(
                filters,
                auth,
            );
            return res.status(200).json({
                message: 'Citas obtenidas correctamente',
                data,
            });
        } catch (error) {
            next(error);
        }
    };

    getCalendar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const filters = mapToAppointmentCalendarFilter(req.query);
            const auth = extractAuthContext(req);
            const data = await this.appointmentService.getCalendar(
                filters,
                auth,
            );
            return res.status(200).json({
                message: 'Citas obtenidas correctamente',
                data,
            });
        } catch (error) {
            next(error);
        }
    };

    approve = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, auth } = extractRequestContextWithId(req);
            await this.appointmentService.approve(id, auth);
            return res.status(200).json({
                message: 'Cita aprobada correctamente',
            });
        } catch (error) {
            next(error);
        }
    };

    reject = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, auth } = extractRequestContextWithId(req);
            const input = { id, ...req.body };
            await this.appointmentService.reject(input, auth);
            return res.status(200).json({
                message: 'Cita rechazada correctamente',
            });
        } catch (error) {
            next(error);
        }
    };

    cancel = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, auth } = extractRequestContextWithId(req);
            await this.appointmentService.cancel(id, auth);
            return res.status(200).json({
                message: 'Cita cancelada correctamente',
            });
        } catch (error) {
            next(error);
        }
    };

    changeStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, auth } = extractRequestContextWithId(req);
            const input = { id, ...req.body };
            await this.appointmentService.changeStatus(input, auth);
            return res.status(200).json({
                message: 'Estado de la cita actualizado correctamente',
            });
        } catch (error) {
            next(error);
        }
    };
}

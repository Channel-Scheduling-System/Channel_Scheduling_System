import { Router } from 'express';
import { requireRole } from '../../shared/middlewares/role.middleware.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { appointmentController } from '../index.js';
import { appointmentValidator } from './appointment.validator.js';
import { clientAddAppointmentLimiter } from '../../config/security.js';

const appointmentRouter = Router();

appointmentRouter.use(authMiddleware);

appointmentRouter.post(
    '/verify-overlap',
    requireRole(['WORKER', 'CLIENT']),
    appointmentValidator.verifyOverlap,
    appointmentController.verifyOverlap,
);

appointmentRouter.post(
    '/',
    requireRole(['WORKER', 'CLIENT']),
    clientAddAppointmentLimiter,
    appointmentValidator.create,
    appointmentController.add,
);

appointmentRouter.get(
    '/history',
    requireRole(['WORKER', 'CLIENT']),
    appointmentValidator.historyFilters,
    appointmentController.getHistory,
);

appointmentRouter.get(
    '/:id',
    requireRole(['WORKER', 'CLIENT']),
    appointmentValidator.id,
    appointmentController.getById,
);

export default appointmentRouter;

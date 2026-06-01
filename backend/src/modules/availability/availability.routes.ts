import { Router } from 'express';
import { availabilityValidator } from './availability.validator.js';
import { availabilityController } from '../index.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';

const availabilityRouter = Router();

availabilityRouter.use(authMiddleware);

availabilityRouter.put(
    '/:id/working-hours',
    requireRole('WORKER'),
    availabilityValidator.id,
    availabilityValidator.createWorkHour,
    availabilityController.addWorkingHours,
);

availabilityRouter.post(
    '/:id/time-off',
    requireRole('WORKER'),
    availabilityValidator.id,
    availabilityValidator.createTimeOff,
    availabilityController.addTimeOff,
);

availabilityRouter.post(
    '/:id/day-off',
    requireRole('WORKER'),
    availabilityValidator.id,
    availabilityValidator.createDayOff,
    availabilityController.addDayOff,
);

availabilityRouter.post(
    '/:id/period-off',
    requireRole('WORKER'),
    availabilityValidator.id,
    availabilityValidator.createPeriodOff,
    availabilityController.addPeriodOff,
);

availabilityRouter.get(
    '/worker/:id',
    requireRole('CLIENT'),
    availabilityValidator.id,
    availabilityValidator.clientFilters,
    availabilityController.getBasicAvailability,
);

availabilityRouter.get(
    '/:id/config',
    requireRole('WORKER'),
    availabilityValidator.id,
    availabilityValidator.workerFilters,
    availabilityController.getFullAvailability,
);

availabilityRouter.delete(
    '/:id',
    requireRole('WORKER'),
    availabilityValidator.id,
    availabilityController.delete,
);

export default availabilityRouter;

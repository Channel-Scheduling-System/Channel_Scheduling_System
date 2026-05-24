import { Router } from 'express';
import { availabilityValidator } from './availability.validator.js';
import { availabilityController } from './availability.module.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';

const availabilityRouter = Router();

availabilityRouter.put(
    '/:id/working-hours',
    authMiddleware,
    requireRole('WORKER'),
    availabilityValidator.id,
    availabilityValidator.createWorkHour,
    availabilityController.addWorkingHours,
);

availabilityRouter.post(
    '/:id/time-off',
    authMiddleware,
    requireRole('WORKER'),
    availabilityValidator.id,
    availabilityValidator.createTimeOff,
    availabilityController.addTimeOff,
);

availabilityRouter.post(
    '/:id/day-off',
    authMiddleware,
    requireRole('WORKER'),
    availabilityValidator.id,
    availabilityValidator.createDayOff,
    availabilityController.addDayOff,
);

availabilityRouter.post(
    '/:id/period-off',
    authMiddleware,
    requireRole('WORKER'),
    availabilityValidator.id,
    availabilityValidator.createPeriodOff,
    availabilityController.addPeriodOff,
);

availabilityRouter.get(
    '/worker/:id',
    authMiddleware,
    requireRole('CLIENT'),
    availabilityValidator.id,
    availabilityValidator.clientFilters,
    availabilityController.getBasicAvailability,
);

availabilityRouter.get(
    '/:id/config',
    authMiddleware,
    requireRole('WORKER'),
    availabilityValidator.id,
    availabilityValidator.workerFilters,
    availabilityController.getFullAvailability,
);

availabilityRouter.delete(
    '/:id',
    authMiddleware,
    requireRole('WORKER'),
    availabilityValidator.id,
    availabilityController.delete,
);

export default availabilityRouter;

import { Router } from 'express';
import { availabilityValidator } from './availability.validator.js';
import { availabilityController } from './availability.module.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';

const availabilityRouter = Router();

availabilityRouter.post(
    '/:id/working-hours',
    authMiddleware,
    requireRole('WORKER'),
    availabilityValidator.id,
    availabilityValidator.createWorkHour,
    availabilityController.addWorkingHours,
);

export default availabilityRouter;

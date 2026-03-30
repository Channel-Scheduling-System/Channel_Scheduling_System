import { Router } from 'express';
import { serviceController } from './service.module.js';
import { serviceValidator } from './service.validator.js';
import { authMiddleware } from '#/shared/middlewares/auth.middleware.js';
import { requireRole } from '#/shared/middlewares/role.middleware.js';

const serviceRouter = Router();

serviceRouter.post(
    '/',
    authMiddleware,
    requireRole('WORKER'),
    serviceValidator.create,
    serviceController.add,
);

export default serviceRouter;

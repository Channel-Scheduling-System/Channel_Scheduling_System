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

serviceRouter.get(
    '/',
    authMiddleware,
    serviceValidator.filters,
    serviceController.getAll,
);

serviceRouter.get(
    '/:id',
    authMiddleware,
    serviceValidator.id,
    serviceController.getById,
);

export default serviceRouter;

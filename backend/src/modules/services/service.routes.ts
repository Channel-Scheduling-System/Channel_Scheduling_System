import { Router } from 'express';
import { serviceController } from '../index.js';
import { serviceValidator } from './service.validator.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';

const serviceRouter = Router();

serviceRouter.use(authMiddleware);

serviceRouter.post(
    '/',
    requireRole('WORKER'),
    serviceValidator.create,
    serviceController.add,
);

serviceRouter.get('/', serviceValidator.filters, serviceController.getAll);

serviceRouter.get('/:id', serviceValidator.id, serviceController.getById);

serviceRouter.put(
    '/:id',
    requireRole('WORKER'),
    serviceValidator.id,
    serviceValidator.update,
    serviceController.update,
);

serviceRouter.patch(
    '/:id/state',
    requireRole('WORKER'),
    serviceValidator.id,
    serviceValidator.updateState,
    serviceController.updateState,
);

serviceRouter.delete(
    '/:id',
    requireRole('WORKER'),
    serviceValidator.id,
    serviceController.delete,
);

export default serviceRouter;

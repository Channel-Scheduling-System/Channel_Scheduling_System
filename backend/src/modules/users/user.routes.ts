import { Router } from 'express';
import { userController } from './user.module.js';
import { userValidator } from './user.validator.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';

const userRouter = Router();

userRouter.post(
    '/admin/first',
    userValidator.createFirstAdmin,
    userController.addFirstAdmin,
);

userRouter.post(
    '/',
    authMiddleware,
    requireRole(['ADMIN', 'WORKER']),
    userValidator.create,
    userController.add,
);

userRouter.get(
    '/',
    authMiddleware,
    userValidator.filters,
    userController.getAll,
);

userRouter.get(
    '/:id',
    authMiddleware,
    userValidator.id,
    userController.getById,
);

export default userRouter;
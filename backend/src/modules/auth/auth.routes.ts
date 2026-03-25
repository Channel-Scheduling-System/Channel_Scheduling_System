import { Router } from 'express';
import { authController } from './auth.module.js';
import { authValidator } from './auth.validator.js';
import { loginLimiter, registerLimiter } from '#/config/security.js';
import { authMiddleware } from '#/shared/middlewares/auth.middleware.js';

const authRouter = Router();

authRouter.post(
    '/register',
    registerLimiter,
    authValidator.register,
    authController.register,
);

authRouter.post(
    '/login',
    loginLimiter,
    authValidator.login,
    authController.login,
);

authRouter.post('/refresh', authValidator.refreshToken, authController.refresh);

authRouter.post(
    '/logout',
    authMiddleware,
    authValidator.refreshToken,
    authController.logout,
);

authRouter.get('/admin/exists', authController.checkAdminExists);

export default authRouter;

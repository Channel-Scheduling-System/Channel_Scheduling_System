import { Router } from 'express';
import { authController } from './auth.module.js';
import { authValidator } from './auth.validator.js';
import {
    loginLimiter,
    passwordResetLimiter,
    registerLimiter,
    verifyResetCodeLimiter,
} from '../../config/security.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { resetTokenMiddleware } from '#/shared/middlewares/reset-pass.middleware.js';

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

authRouter.post(
    '/password-reset/request',
    passwordResetLimiter,
    authValidator.requestPasswordReset,
    authController.requestPasswordReset,
);

authRouter.post(
    '/password-reset/verify',
    verifyResetCodeLimiter,
    authValidator.verifyResetCode,
    authController.verifyResetCode,
);

authRouter.post(
    '/password-reset/reset',
    resetTokenMiddleware,
    authValidator.resetPassword,
    authController.resetPassword,
);

authRouter.get('/admin/exists', authController.checkAdminExists);

export default authRouter;

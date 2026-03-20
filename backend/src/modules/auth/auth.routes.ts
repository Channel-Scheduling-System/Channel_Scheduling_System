import { Router } from 'express';
import { authController } from './auth.module.js';
import { authValidator } from './auth.validator.js';

const authRouter = Router();

authRouter.post('/login', authValidator.login, authController.login);
authRouter.post('/register', authValidator.register, authController.register);

export default authRouter;

import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { userService } from '../users/index.js';
import { resetCodeService } from '../reset-codes/index.js';

const authRepo = new AuthRepository();
const authService = new AuthService(authRepo, userService, resetCodeService);
const authController = new AuthController(authService);

export { authController };

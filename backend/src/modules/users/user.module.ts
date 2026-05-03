import { UserController } from './user.controller.js';
import { UserRepository } from './user.repository.js';
import { UserService } from './user.service.js';
import { AuthRepository } from '../auth/auth.repository.js';

const userRepository = new UserRepository();
const authRepository = new AuthRepository();
const userService = new UserService(userRepository, authRepository);
const userController = new UserController(userService);

export { userController, userService };

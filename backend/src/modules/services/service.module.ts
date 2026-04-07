import { ServiceRepository } from './service.repository.js';
import { ServiceService } from './service.service.js';
import { ServiceController } from './service.controller.js';
import { userService } from '../users/index.js';

const serviceRepo = new ServiceRepository();
const serviceService = new ServiceService(serviceRepo, userService);
const serviceController = new ServiceController(serviceService);

export { serviceController, serviceService };

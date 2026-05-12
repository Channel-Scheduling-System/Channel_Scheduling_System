import { AvailabilityRepository } from './availability.repository.js';
import { AvailabilityService } from './availability.service.js';
import { AvailabilityController } from './availability.controller.js';
import { userService } from '../users/index.js';

const availabilityRepo = new AvailabilityRepository();
const availabilityService = new AvailabilityService(availabilityRepo, userService);
const availabilityController = new AvailabilityController(availabilityService);

export { availabilityController, availabilityService };
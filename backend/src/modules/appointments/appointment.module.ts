import { AppointmentRepository } from './appointment.repository.js';
import { AppointmentService } from './appointment.service.js';
import { AppointmentController } from './appointment.controller.js';
import { userService } from '../users/index.js';
import { serviceService } from '../services/index.js';
import { availabilityService } from '../availability/index.js';

const appointmentRepo = new AppointmentRepository();
const appointmentService = new AppointmentService(
    appointmentRepo,
    userService,
    serviceService,
    availabilityService,
);
const appointmentController = new AppointmentController(appointmentService);

export { appointmentController, appointmentService };

// ============================================================================
// AUTH REPOSITORY - Sin dependencias
// ============================================================================
import { AuthRepository } from './auth/auth.repository.js';
import { AuthService } from './auth/auth.service.js';
import { AuthController } from './auth/auth.controller.js';

const authRepository = new AuthRepository();

// ============================================================================
// USERS MODULE - Depende de authRepository
// ============================================================================
import { UserController } from './users/user.controller.js';
import { UserRepository } from './users/user.repository.js';
import { UserService } from './users/user.service.js';

const userRepository = new UserRepository();
const userService = new UserService(userRepository, authRepository);
const userController = new UserController(userService);

// ============================================================================
// SERVICES MODULE - Depende de userService
// ============================================================================
import { ServiceRepository } from './services/service.repository.js';
import { ServiceService } from './services/service.service.js';
import { ServiceController } from './services/service.controller.js';

const serviceRepository = new ServiceRepository();
const serviceService = new ServiceService(serviceRepository, userService);
const serviceController = new ServiceController(serviceService);

// ============================================================================
// RESET-CODES MODULE - Sin dependencias
// ============================================================================
import { ResetCodeRepository } from './reset-codes/reset-code.repository.js';
import { ResetCodeService } from './reset-codes/reset-code.service.js';

const resetCodeRepository = new ResetCodeRepository();
const resetCodeService = new ResetCodeService(resetCodeRepository);

// ============================================================================
// AUTH SERVICE - Depende de userService y resetCodeService (instanciar aquí)
// ============================================================================
const authService = new AuthService(
    authRepository,
    userService,
    resetCodeService,
);
const authController = new AuthController(authService);

// ============================================================================
// APPOINTMENTS MODULE - Depende de userService, serviceService y availabilityService
// ============================================================================
import { AppointmentRepository } from './appointments/appointment.repository.js';
import { AppointmentService } from './appointments/appointment.service.js';
import { AppointmentController } from './appointments/appointment.controller.js';

const appointmentRepository = new AppointmentRepository();
// Instanciar con null temporalmente - se asignará después
const appointmentService = new AppointmentService(
    appointmentRepository,
    userService,
    serviceService,
    getAvailabilityService,
);
const appointmentController = new AppointmentController(appointmentService);

// ============================================================================
// AVAILABILITY MODULE - Depende de userService y appointmentService
// ============================================================================
import { AvailabilityRepository } from './availability/availability.repository.js';
import { IAvailabilityService } from './availability/availability.service.js';
import { AvailabilityService } from './availability/availability.service.js';
import { AvailabilityController } from './availability/availability.controller.js';

const availabilityRepository = new AvailabilityRepository();
const availabilityService = new AvailabilityService(
    availabilityRepository,
    userService,
    appointmentService, // Ya existe
);
const availabilityController = new AvailabilityController(availabilityService);

function getAvailabilityService(): IAvailabilityService {
    return availabilityService;
}

export {
    // Auth
    authRepository,
    authService,
    authController,
    // Users
    userRepository,
    userService,
    userController,
    // Services
    serviceRepository,
    serviceService,
    serviceController,
    // ResetCodes
    resetCodeRepository,
    resetCodeService,
    // Appointments
    appointmentRepository,
    appointmentService,
    appointmentController,
    // Availability
    availabilityRepository,
    availabilityService,
    availabilityController,
};

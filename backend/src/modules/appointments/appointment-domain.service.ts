import { OverlapValidator } from './validators/overlap.validator.js';
import { IAppointmentRepository } from './appointment.repository.js';
import { IUserService } from '../users/user.service.js';
import { IServiceService } from '../services/service.service.js';
import { IAvailabilityService } from '../availability/availability.service.js';
import {
    OverlapVerificationResponse,
    Role,
    VerifyOverlapInput,
} from './appointment.types.js';
import {
    ConflictError,
    NotFoundError,
} from '../../shared/errors/domain.error.js';
import { APPOINTMENT_ERRORS } from '../../shared/constants/messages.js';
import { isFutureDate } from '../../shared/utils/temporal.util.js';
import { AuthContext } from '../../shared/utils/request-parser.util.js';

export class AppointmentDomainService {
    private readonly overlapValidator: OverlapValidator;

    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly userService: IUserService,
        private readonly serviceService: IServiceService,
        private readonly availabilityService: IAvailabilityService,
    ) {
        this.overlapValidator = new OverlapValidator(
            appointmentRepo,
            availabilityService,
        );
    }

    async ensureWorkerExists(workerId: number): Promise<void> {
        if (!(await this.userService.existsByIdAndRole(workerId, 'WORKER'))) {
            throw new NotFoundError(APPOINTMENT_ERRORS.WORKER_NOT_FOUND);
        }
    }

    async ensureClientExists(clientId: number): Promise<void> {
        if (!(await this.userService.existsByIdAndRole(clientId, 'CLIENT'))) {
            throw new NotFoundError(APPOINTMENT_ERRORS.CLIENT_NOT_FOUND);
        }
    }

    async ensureServicesExist(
        services: { serviceId: number }[],
    ): Promise<void> {
        await Promise.all(
            services.map(async ({ serviceId }) => {
                const exists = await this.serviceService.existsById(serviceId);
                if (!exists) {
                    throw new NotFoundError(
                        APPOINTMENT_ERRORS.SERVICE_NOT_FOUND(serviceId),
                    );
                }
            }),
        );
    }

    checkCreationOwnership(
        auth: AuthContext,
        workerId: number,
        clientId: number,
    ) {
        if (auth.role === 'WORKER' && auth.id !== workerId)
            throw new ConflictError(APPOINTMENT_ERRORS.OWNER_CREATION_MISMATCH);
        if (auth.role === 'CLIENT' && auth.id !== clientId)
            throw new ConflictError(APPOINTMENT_ERRORS.OWNER_CREATION_MISMATCH);
    }

    async verifyOverlaps(
        input: VerifyOverlapInput,
    ): Promise<OverlapVerificationResponse> {
        return this.overlapValidator.verify(input, Role.WORKER);
    }

    async ensureNoOverlaps(
        input: VerifyOverlapInput,
        role: Role,
    ): Promise<void> {
        const verification = await this.overlapValidator.verify(input, role);
        if (!verification.allowed)
            throw new ConflictError(verification.message);
        if (role === 'CLIENT' && verification.needsConfirmation)
            throw new ConflictError(APPOINTMENT_ERRORS.CANT_BE_REQUESTED);
    }

    checkFutureDate(date: string): void {
        if (!isFutureDate(date))
            throw new ConflictError(APPOINTMENT_ERRORS.APPOINTMENT_IN_PAST);
    }
}

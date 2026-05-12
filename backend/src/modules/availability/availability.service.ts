import { IUserService } from '../users/user.service.js';
import { IAvailabilityRepository } from './availability.repository.js';
import { CreateWorkingHoursInput, WorkingHourInput } from './availability.types.js';
import { AVAILABILITY_ERRORS } from '#/shared/constants/messages.js';
import { ConflictError, NotFoundError } from '../../shared/errors/domain.error.js';
import { mapToCreateWorkingHoursData } from './availability.mapper.js';

export interface IAvailabilityService {
    addWorkingHours(input: CreateWorkingHoursInput): Promise<void>;
}

export class AvailabilityService implements IAvailabilityService {
    constructor(
        private readonly availabilityRepo: IAvailabilityRepository,
        private readonly userService: IUserService,
    ) {}

    async addWorkingHours(input: CreateWorkingHoursInput): Promise<void> {
        await this.ensureWorkerExists(input.workerId);
        this.validateUniqueWorkingDays(input.workingHours);
        // Eliminar horarios anteriores y agregar los nuevos
        await this.availabilityRepo.deleteWorkingHoursByWorkerId(input.workerId);
        const workingHoursData = mapToCreateWorkingHoursData(input);
        await this.availabilityRepo.createWorkingHourBulk(workingHoursData);
        // TODO: Los días no enviados se toman como días bloquedos
    }

    // VALIDACIONES DE NEGOCIO Y PERMISOS
    //* -----------------------------

    private async ensureWorkerExists(workerId: number): Promise<void> {
        if (!(await this.userService.existsByIdAndRole(workerId, 'WORKER'))) {
            throw new NotFoundError(AVAILABILITY_ERRORS.WORKER_NOT_FOUND);
        }
    }

    private validateUniqueWorkingDays(workingHours: WorkingHourInput[]): void {
        const daysOfWeek = new Set<string>();
        for (const wh of workingHours) {
            if (daysOfWeek.has(wh.dayOfWeek)) {
                throw new ConflictError(AVAILABILITY_ERRORS.DUPLICATE_DAYOFWEEK);
            }
            daysOfWeek.add(wh.dayOfWeek);
        }
    }

}

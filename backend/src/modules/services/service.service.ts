import { IServiceRepository } from './service.repository.js';

import {
    CreateServiceInput,
    ServiceResponse,
    ServiceFilters,
    UpdateServiceInput,
    UpdateStateInput,
    ServiceWithWorker,
} from './service.types.js';
import {
    mapToCreateServiceData,
    mapToServiceResponse,
    mapToServicesResponse,
    mapToUpdateServiceData,
} from './service.mapper.js';

import {
    ConflictError,
    NotFoundError,
} from '../../shared/errors/domain.error.js';
import { IUserService } from '../users/user.service.js';

import { SERVICE_ERRORS } from '../../shared/constants/messages.js';
import { AuthContext } from '../users/user-role.validator.js';

export interface IServiceService {
    add(input: CreateServiceInput): Promise<void>;
    existsById(id: number): Promise<boolean>;
    getById(id: number): Promise<ServiceResponse>;
    getAll(filters: ServiceFilters): Promise<ServiceResponse[]>;
    update(input: UpdateServiceInput): Promise<void>;
    updateState(input: UpdateStateInput, auth?: AuthContext): Promise<boolean>;
    delete(id: number): Promise<void>;
}

export class ServiceService implements IServiceService {
    constructor(
        private readonly serviceRepo: IServiceRepository,
        private readonly userService: IUserService,
    ) {}

    async add(input: CreateServiceInput): Promise<void> {
        await this.ensureWorkerExists(input.workerId);
        await this.ensureNameIsUnique(input.workerId, input.name);
        await this.serviceRepo.create(mapToCreateServiceData(input));
    }

    async existsById(id: number): Promise<boolean> {
        return this.serviceRepo.existsById(id);
    }

    async getById(id: number): Promise<ServiceResponse> {
        // TODO: Validar que el servicio sea visible para el rol del auth
        const service = await this.getServiceOrFail(id);
        return mapToServiceResponse(service);
    }

    async getAll(filters: ServiceFilters): Promise<ServiceResponse[]> {
        // TODO: Validar que los servicios sean visibles para el rol del auth
        return mapToServicesResponse(await this.serviceRepo.findAll(filters));
    }

    async update(input: UpdateServiceInput): Promise<void> {
        const existing = await this.getServiceOrFail(input.id);
        if (input.name && input.name !== existing.name) {
            await this.ensureNameIsUnique(existing.workerId, input.name);
        }
        await this.serviceRepo.update(input.id, mapToUpdateServiceData(input));
    }

    async updateState(
        input: UpdateStateInput,
        auth?: AuthContext,
    ): Promise<boolean> {
        const service = await this.getServiceOrFail(input.id, true);
        if (auth) this.validateCanUpdateState(auth, service.workerId);
        await this.serviceRepo.updateIsActive(input.id, input.isActive);
        return input.isActive;
    }

    async delete(id: number): Promise<void> {
        await this.getServiceOrFail(id, true);
        // TODO: Verificar que el servicio no tenga citas asociadas
        await this.serviceRepo.delete(id);
    }

    private async getServiceOrFail(
        id: number,
        includeInactive: boolean = false,
    ): Promise<ServiceWithWorker> {
        const service = await this.serviceRepo.findById(id);
        if (!service) throw new NotFoundError(SERVICE_ERRORS.ID_NOTFOUND);
        if (includeInactive === false && !service.isActive)
            throw new NotFoundError(SERVICE_ERRORS.ID_NOTFOUND);
        return service;
    }

    // VALIDACIONES DE NEGOCIO Y PERMISOS
    //* -----------------------------

    private async ensureWorkerExists(workerId: number): Promise<void> {
        if (!(await this.userService.existsByIdAndRole(workerId, 'WORKER'))) {
            throw new NotFoundError(SERVICE_ERRORS.WORKER_NOT_FOUND);
        }
    }

    private async ensureNameIsUnique(
        workerId: number,
        name: string,
    ): Promise<void> {
        const existingUser = await this.serviceRepo.existsByName(
            workerId,
            name,
        );
        if (existingUser) throw new ConflictError(SERVICE_ERRORS.NAME_CONFLICT);
    }

    private validateCanUpdateState(auth: AuthContext, workerId: number): void {
        if (auth.id !== workerId) {
            throw new ConflictError(SERVICE_ERRORS.UPDATE_STATE_FORBIDDEN);
        }
    }
}

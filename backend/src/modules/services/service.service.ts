import { IServiceRepository } from './service.repository.js';

import {
    Service,
    CreateServiceInput,
    ServiceResponse,
    ServiceFilters,
    UpdateServiceInput,
} from './service.types.js';
import {
    mapToCreateServiceData,
    mapToServiceResponse,
    mapToServicesResponse,
    mapToUpdateServiceData,
} from './service.mapper.js';

import { ConflictError, NotFoundError } from '#/shared/errors/domain.error.js';
import { IUserService } from '../users/user.service.js';

export interface IServiceService {
    add(input: CreateServiceInput): Promise<ServiceResponse>;
    existsById(id: number): Promise<boolean>;
    getById(id: number): Promise<ServiceResponse>;
    getAll(filters: ServiceFilters): Promise<ServiceResponse[]>;
    update(input: UpdateServiceInput): Promise<ServiceResponse>;
    delete(id: number): Promise<void>;
}

const SERVICE_ERRORS = {
    WORKER_NOT_FOUND: 'El trabajador asociado al servicio no existe',
    NAME_CONFLICT: 'El usuario ya tiene un servicio con ese nombre',
    ID_NOTFOUND: 'El servicio con el id solicitado no existe',
};

export class ServiceService implements IServiceService {
    constructor(
        private readonly serviceRepo: IServiceRepository,
        private readonly userService: IUserService,
    ) {}

    async add(input: CreateServiceInput): Promise<ServiceResponse> {
        await this.ensureWorkerExists(input.workerId);
        await this.ensureNameIsUnique(input.workerId, input.name);
        const newService = await this.serviceRepo.create(
            mapToCreateServiceData(input),
        );
        return mapToServiceResponse(newService);
    }

    async existsById(id: number): Promise<boolean> {
        return this.serviceRepo.existsById(id);
    }

    async getById(id: number): Promise<ServiceResponse> {
        const service = await this.getServiceOrFail(id);
        return mapToServiceResponse(service);
    }

    async getAll(filters: ServiceFilters): Promise<ServiceResponse[]> {
        return mapToServicesResponse(await this.serviceRepo.findAll(filters));
    }

    async update(input: UpdateServiceInput): Promise<ServiceResponse> {
        const existing = await this.getServiceOrFail(input.id);
        if (input.name && input.name !== existing.name) {
            await this.ensureNameIsUnique(existing.workerId, input.name);
        }
        const updated = await this.serviceRepo.update(
            input.id,
            mapToUpdateServiceData(input),
        );
        return mapToServiceResponse(updated);
    }

    async delete(id: number): Promise<void> {
        await this.getServiceOrFail(id);
        // TODO: Verificar que el servicio no tenga citas asociadas
        await this.serviceRepo.delete(id);
    }

    private async getServiceOrFail(id: number): Promise<Service> {
        const service = await this.serviceRepo.findById(id);
        if (!service) throw new NotFoundError(SERVICE_ERRORS.ID_NOTFOUND);
        return service;
    }

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
}

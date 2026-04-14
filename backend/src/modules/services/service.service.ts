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

import {
    ConflictError,
    NotFoundError,
} from '../../shared/errors/domain.error.js';
import { IUserService } from '../users/user.service.js';

import { SERVICE_ERRORS } from '../../shared/constants/messages.js';

export interface IServiceService {
    add(input: CreateServiceInput): Promise<ServiceResponse>;
    existsById(id: number): Promise<boolean>;
    getById(id: number): Promise<ServiceResponse>;
    getAll(filters: ServiceFilters): Promise<ServiceResponse[]>;
    update(input: UpdateServiceInput): Promise<ServiceResponse>;
    delete(id: number): Promise<void>;
}

export class ServiceService implements IServiceService {
    constructor(
        private readonly serviceRepo: IServiceRepository,
        private readonly userService: IUserService,
    ) {}

    async add(input: CreateServiceInput): Promise<ServiceResponse> {
        await this.ensureWorkerExists(input.workerId);
        await this.ensureNameIsUnique(input.workerId, input.name);
        const service = await this.serviceRepo.create(
            mapToCreateServiceData(input),
        );
        return mapToServiceResponse(service);
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
        await this.serviceRepo.update(input.id, mapToUpdateServiceData(input));
        const updatedService = await this.getServiceOrFail(input.id);
        return mapToServiceResponse(updatedService);
    }

    async delete(id: number): Promise<void> {
        await this.getServiceOrFail(id);
        // TODO: Verificar que el servicio no tenga citas asociadas
        await this.serviceRepo.delete(id);
    }

    // TODO: Add changeStatus (activate/deactivate)
    // - Solo el worker asignado pueden modificar el servicio

    private async getServiceOrFail(id: number): Promise<Service> {
        const service = await this.serviceRepo.findById(id);
        if (!service) throw new NotFoundError(SERVICE_ERRORS.ID_NOTFOUND);
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
}

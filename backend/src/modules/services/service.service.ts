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

export interface IServiceService {
    add(input: CreateServiceInput): Promise<ServiceResponse>;
    existsById(id: number): Promise<boolean>;
    getById(id: number): Promise<ServiceResponse>;
    getAll(filters: ServiceFilters): Promise<ServiceResponse[]>;
    update(input: UpdateServiceInput): Promise<ServiceResponse>;
}

export class ServiceService implements IServiceService {
    constructor(private readonly serviceRepo: IServiceRepository) {}
    async add(input: CreateServiceInput): Promise<ServiceResponse> {
        // TODO: 1. Validar existencia de worker
        await this.ensureWorkerExists(input.workerId);
        // 2. Verificar nombre único para el worker
        await this.ensureNameIsUnique(input.workerId, input.name);
        // 3. Crear nuevo servicio
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
        // 1. Verificar existencia de servicio
        const existing = await this.getServiceOrFail(input.id);
        // 2. Si se actualiza el nombre, verificar que sea único para el worker
        if (input.name && input.name !== existing.name) {
            await this.ensureNameIsUnique(existing.workerId, input.name);
        }
        // 3. Actualizar servicio
        const updated = await this.serviceRepo.update(
            input.id,
            mapToUpdateServiceData(input),
        );
        return mapToServiceResponse(updated);
    }

    private async getServiceOrFail(id: number): Promise<Service> {
        const service = await this.serviceRepo.findById(id);
        if (!service)
            throw new NotFoundError(
                'El servicio con el id solicitado no existe',
            );
        return service;
    }

    private async ensureWorkerExists(workerId: number): Promise<void> {
        // TODO: Implementar método para verificar existencia de worker
    }

    private async ensureNameIsUnique(
        workerId: number,
        name: string,
    ): Promise<void> {
        const existingUser = await this.serviceRepo.existsByName(
            workerId,
            name,
        );
        if (existingUser)
            throw new ConflictError(
                'El usuario ya tiene un servicio con ese nombre',
            );
    }
}

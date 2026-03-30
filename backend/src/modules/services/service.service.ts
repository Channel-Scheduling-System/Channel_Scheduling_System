import { IServiceRepository } from './service.repository.js';

import {
    CreateServiceInput,
    ServiceResponse,
} from './service.types.js';
import {
    mapToCreateServiceData,
    mapToServiceResponse,
} from './service.mapper.js';

import { ConflictError } from '#/shared/errors/domain.error.js';

export interface IServiceService {
    add(input: CreateServiceInput): Promise<ServiceResponse>;
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

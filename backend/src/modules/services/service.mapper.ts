import {
    CreateServiceData,
    CreateServiceInput,
    ServiceResponse,
} from './service.types.js';
import type { Service } from '@prisma/client.js';

/**
 * Maps a service input to an Service entity for database
 * @param service - CreateServiceInput from the API
 * @returns CreateServiceData object formatted for database persistence
 */
export function mapToCreateServiceData(
    service: CreateServiceInput,
): CreateServiceData {
    return {
        workerId: service.workerId,
        name: service.name,
        description: service.description,
        colorHex: service.color,
        defaultDurationMin: service.duration,
        defaultPrice: service.price,
    };
}

/**
 * Maps a service entity to an ServiceResponse object
 * @param service - Service entity from the database
 * @returns ServiceResponse object formatted for API responses
 */
export function mapToServiceResponse(service: Service): ServiceResponse {
    return {
        id: service.id,
        name: service.name,
        description: service.description || '',
        color: service.colorHex,
        price: service.defaultPrice,
        duration: service.defaultDurationMin,
    };
}

import {
    CreateServiceData,
    CreateServiceInput,
    ServiceResponse,
    ServiceFilters,
    UpdateServiceInput,
    UpdateServiceData,
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
 * Maps a service input to an Service entity for database
 * @param service - UpdateServiceInput from the API
 * @returns UpdateServiceData object formatted for database persistence
 */
export function mapToUpdateServiceData(
    service: UpdateServiceInput,
): UpdateServiceData {
    return {
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
        isActive: service.isActive,
    };
}

/**
 * Maps an array of service entities to an array of ServiceResponse objects
 * @param services - Array of Service entities from the database
 * @returns Array of ServiceResponse objects formatted for API responses
 */
export function mapToServicesResponse(services: Service[]): ServiceResponse[] {
    return services.map(mapToServiceResponse);
}

/**
 * Maps and normalizes query filters for service queries
 * @param filters - Query filters that may contain string values
 * @returns Normalized ServiceFilters object with correct types
 */
export function mapToServiceFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filters: Record<string, any>,
): ServiceFilters {
    return {
        ...(filters.workerId && {
            workerId:
                typeof filters.workerId === 'string'
                    ? parseInt(filters.workerId, 10)
                    : filters.workerId,
        }),
    };
}

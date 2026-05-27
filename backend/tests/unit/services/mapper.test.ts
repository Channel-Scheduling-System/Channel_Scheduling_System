/// <reference types="jest" />

import {
    mapToCreateServiceData,
    mapToUpdateServiceData,
    mapToServiceResponse,
    mapToServicesResponse,
} from '../../../src/modules/services/service.mapper';

function buildServiceEntity(overrides: Record<string, unknown> = {}) {
    return {
        id: 1,
        workerId: 10,
        name: 'Haircut',
        description: 'Classic haircut',
        colorHex: '#FF5733',
        defaultPrice: 25000,
        defaultDurationMin: 45,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    } as any;
}

describe('service.mapper', () => {
    describe('mapToCreateServiceData', () => {
        it('should map CreateServiceInput to DB format', () => {
            const input = {
                workerId: 10,
                name: 'Haircut',
                description: 'Classic haircut',
                color: '#FF5733',
                price: 25000,
                duration: 45,
            };

            const result = mapToCreateServiceData(input);

            expect(result).toEqual({
                workerId: 10,
                name: 'Haircut',
                description: 'Classic haircut',
                colorHex: '#FF5733',
                defaultPrice: 25000,
                defaultDurationMin: 45,
            });
        });
    });

    describe('mapToUpdateServiceData', () => {
        it('should map UpdateServiceInput to DB format', () => {
            const input = {
                name: 'Beard Trim',
                description: 'Precision beard trim',
                color: '#00BFFF',
                price: 15000,
                duration: 30,
            };

            const result = mapToUpdateServiceData(input);

            expect(result).toEqual({
                name: 'Beard Trim',
                description: 'Precision beard trim',
                colorHex: '#00BFFF',
                defaultPrice: 15000,
                defaultDurationMin: 30,
            });
        });

        it('should pass through undefined optional fields', () => {
            const input = { name: 'Trim' } as any;
            const result = mapToUpdateServiceData(input);
            expect(result.name).toBe('Trim');
            expect(result.description).toBeUndefined();
        });
    });

    describe('mapToServiceResponse', () => {
        it('should map a Service entity to a ServiceResponse', () => {
            const entity = buildServiceEntity();

            const result = mapToServiceResponse(entity);

            expect(result).toEqual({
                id: 1,
                name: 'Haircut',
                description: 'Classic haircut',
                color: '#FF5733',
                price: 25000,
                duration: 45,
                isActive: true,
            });
        });

        it('should return empty string when description is null', () => {
            const entity = buildServiceEntity({ description: null });
            const result = mapToServiceResponse(entity);
            expect(result.description).toBe('');
        });
    });

    describe('mapToServicesResponse', () => {
        it('should map an array of entities', () => {
            const entities = [
                buildServiceEntity({ id: 1, name: 'A' }),
                buildServiceEntity({ id: 2, name: 'B' }),
            ];

            const result = mapToServicesResponse(entities);

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('A');
            expect(result[1].name).toBe('B');
        });

        it('should return an empty array for an empty input', () => {
            expect(mapToServicesResponse([])).toEqual([]);
        });
    });
});

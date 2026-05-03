/// <reference types="jest" />

import {
    CreateServiceDTO,
    UpdateServiceDTO,
    ServiceFiltersSchema,
} from '../../../src/modules/services/service.validator';

describe('Service DTO validators', () => {
    it('should validate a correct CreateServiceDTO payload', () => {
        const result = CreateServiceDTO.safeParse({
            workerId: 1,
            name: 'Corte de cabello',
            description: 'Servicio de corte de cabello profesional',
            color: '#FF5733',
            price: 50000,
            duration: 30,
        });

        expect(result.success).toBe(true);
    });

    it('should reject CreateServiceDTO with invalid color format', () => {
        const result = CreateServiceDTO.safeParse({
            workerId: 1,
            name: 'Corte de cabello',
            description: 'Servicio de corte de cabello profesional',
            color: 'FF5733', // Missing # symbol
            price: 50000,
            duration: 30,
        });

        expect(result.success).toBe(false);
    });

    it('should reject CreateServiceDTO with invalid price', () => {
        const result = CreateServiceDTO.safeParse({
            workerId: 1,
            name: 'Corte de cabello',
            description: 'Servicio de corte de cabello profesional',
            color: '#FF5733',
            price: -5000, // Negative price
            duration: 30,
        });

        expect(result.success).toBe(false);
    });

    it('should reject CreateServiceDTO with invalid duration', () => {
        const result = CreateServiceDTO.safeParse({
            workerId: 1,
            name: 'Corte de cabello',
            description: 'Servicio de corte de cabello profesional',
            color: '#FF5733',
            price: 50000,
            duration: 2, // Duration too short (minimum 5)
        });

        expect(result.success).toBe(false);
    });

    it('should reject CreateServiceDTO with short name', () => {
        const result = CreateServiceDTO.safeParse({
            workerId: 1,
            name: 'ab', // Too short (minimum 3)
            description: 'Servicio de corte de cabello profesional',
            color: '#FF5733',
            price: 50000,
            duration: 30,
        });

        expect(result.success).toBe(false);
    });

    it('should reject CreateServiceDTO with short description', () => {
        const result = CreateServiceDTO.safeParse({
            workerId: 1,
            name: 'Corte',
            description: 'Corte', // Too short (minimum 10)
            color: '#FF5733',
            price: 50000,
            duration: 30,
        });

        expect(result.success).toBe(false);
    });

    it('should validate UpdateServiceDTO with partial fields', () => {
        const result = UpdateServiceDTO.safeParse({
            id: 1,
            name: 'Nuevo nombre de servicio',
            price: 75000,
        });

        expect(result.success).toBe(true);
    });

    it('should reject UpdateServiceDTO with workerId (read-only field)', () => {
        const result = UpdateServiceDTO.safeParse({
            id: 1,
            name: 'Nuevo nombre',
            workerId: 2, // Should not be allowed
        });

        expect(result.success).toBe(false);
    });

    it('should validate ServiceFiltersSchema with workerId', () => {
        const result = ServiceFiltersSchema.safeParse({
            workerId: 1,
        });

        expect(result.success).toBe(true);
    });

    it('should validate ServiceFiltersSchema with coerced string workerId', () => {
        const result = ServiceFiltersSchema.safeParse({
            workerId: '5',
        });

        expect(result.success).toBe(true);
    });

    it('should validate ServiceFiltersSchema with no filters', () => {
        const result = ServiceFiltersSchema.safeParse({});

        expect(result.success).toBe(true);
    });

    it('should reject CreateServiceDTO with invalid name characters', () => {
        const result = CreateServiceDTO.safeParse({
            workerId: 1,
            name: 'Corte@especial', // Invalid characters
            description: 'Servicio de corte de cabello profesional',
            color: '#FF5733',
            price: 50000,
            duration: 30,
        });

        expect(result.success).toBe(false);
    });

    it('should validate CreateServiceDTO with 3-character hex color', () => {
        const result = CreateServiceDTO.safeParse({
            workerId: 1,
            name: 'Servicio',
            description: 'Servicio de corte de cabello profesional',
            color: '#FFF', // Valid 3-character hex
            price: 50000,
            duration: 30,
        });

        expect(result.success).toBe(true);
    });
});

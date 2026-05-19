/// <reference types="jest" />

import { serviceValidator } from '../../../src/modules/services/service.validator';
import { ValidationDTOError } from '../../../src/shared/errors/validation.error';

describe('Service DTO validators', () => {
    const runMiddleware = async (
        middleware: (req: any, res: any, next: jest.Mock) => void | Promise<void>,
        req: Record<string, any>,
    ) => {
        const res = {} as any;
        const next = jest.fn();

        await middleware(req, res, next);

        return { req, res, next };
    };

    it('should accept a correct create payload', async () => {
        const { next } = await runMiddleware(serviceValidator.create, {
            body: {
                workerId: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte de cabello profesional',
                color: '#FF5733',
                price: 50000,
                duration: 30,
            },
        });

        expect(next).toHaveBeenCalledWith();
    });

    it('should reject create payloads with invalid color format', async () => {
        const { next } = await runMiddleware(serviceValidator.create, {
            body: {
                workerId: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte de cabello profesional',
                color: 'FF5733',
                price: 50000,
                duration: 30,
            },
        });

        expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
    });

    it('should reject create payloads with invalid price', async () => {
        const { next } = await runMiddleware(serviceValidator.create, {
            body: {
                workerId: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte de cabello profesional',
                color: '#FF5733',
                price: -5000,
                duration: 30,
            },
        });

        expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
    });

    it('should reject create payloads with invalid duration', async () => {
        const { next } = await runMiddleware(serviceValidator.create, {
            body: {
                workerId: 1,
                name: 'Corte de cabello',
                description: 'Servicio de corte de cabello profesional',
                color: '#FF5733',
                price: 50000,
                duration: 2,
            },
        });

        expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
    });

    it('should reject create payloads with short name', async () => {
        const { next } = await runMiddleware(serviceValidator.create, {
            body: {
                workerId: 1,
                name: 'ab',
                description: 'Servicio de corte de cabello profesional',
                color: '#FF5733',
                price: 50000,
                duration: 30,
            },
        });

        expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
    });

    it('should reject create payloads with short description', async () => {
        const { next } = await runMiddleware(serviceValidator.create, {
            body: {
                workerId: 1,
                name: 'Corte',
                description: 'Corte',
                color: '#FF5733',
                price: 50000,
                duration: 30,
            },
        });

        expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
    });

    it('should accept a partial update payload', async () => {
        const { next } = await runMiddleware(serviceValidator.update, {
            body: {
                id: 1,
                name: 'Nuevo nombre de servicio',
                price: 75000,
            },
        });

        expect(next).toHaveBeenCalledWith();
    });

    it('should reject update payloads with workerId', async () => {
        const { next } = await runMiddleware(serviceValidator.update, {
            body: {
                id: 1,
                name: 'Nuevo nombre',
                workerId: 2,
            },
        });

        expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
    });

    it('should accept workerId query filters', async () => {
        const { next, req } = await runMiddleware(serviceValidator.filters, {
            query: {
                workerId: 1,
            },
        });

        expect(req.query.workerId).toBe(1);
        expect(next).toHaveBeenCalledWith();
    });

    it('should coerce string workerId in query filters', async () => {
        const { next, req } = await runMiddleware(serviceValidator.filters, {
            query: {
                workerId: '5',
            },
        });

        expect(req.query.workerId).toBe(5);
        expect(next).toHaveBeenCalledWith();
    });

    it('should accept empty query filters', async () => {
        const { next } = await runMiddleware(serviceValidator.filters, {
            query: {},
        });

        expect(next).toHaveBeenCalledWith();
    });

    it('should reject create payloads with invalid name characters', async () => {
        const { next } = await runMiddleware(serviceValidator.create, {
            body: {
                workerId: 1,
                name: 'Corte@especial',
                description: 'Servicio de corte de cabello profesional',
                color: '#FF5733',
                price: 50000,
                duration: 30,
            },
        });

        expect(next).toHaveBeenCalledWith(expect.any(ValidationDTOError));
    });

    it('should accept a 3 character hex color', async () => {
        const { next } = await runMiddleware(serviceValidator.create, {
            body: {
                workerId: 1,
                name: 'Servicio',
                description: 'Servicio de corte de cabello profesional',
                color: '#FFF',
                price: 50000,
                duration: 30,
            },
        });

        expect(next).toHaveBeenCalledWith();
    });
});

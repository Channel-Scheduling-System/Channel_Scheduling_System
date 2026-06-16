/// <reference types="jest" />

import { notFoundMiddleware } from '../../../src/shared/middlewares/not-found.middleware';

describe('notFoundMiddleware', () => {
    it('should respond 404 with path and method', () => {
        const req = { path: '/unknown-route', method: 'GET' } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        notFoundMiddleware(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Ruta no encontrada',
            path: '/unknown-route',
            method: 'GET',
        });
    });

    it('should reflect the actual path and method from the request', () => {
        const req = { path: '/api/users', method: 'DELETE' } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        notFoundMiddleware(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ path: '/api/users', method: 'DELETE' }),
        );
    });
});

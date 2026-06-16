import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DomainError } from '../errors/domain.error.js';
import { InfrastructureError } from '../errors/infrastructure.error.js';
import { ValidationError } from '../errors/validation.error.js';

const send = (
    res: Response,
    status: number,
    message: string,
    extra: Record<string, unknown> = {},
) => res.status(status).json({ message, ...extra });

/**
 * **Error handler middleware**
 * @description Centralized error handling for Express
 */
export function handleErrorMiddleware(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any,
    _req: Request,
    res: Response,
    next: NextFunction,
) {
    if (res.headersSent) return next(error);

    if (error instanceof z.ZodError)
        return send(res, 400, 'Error de validación', {
            code: 'VALIDATION_ERROR',
        });

    if (error instanceof ValidationError)
        return send(res, error.status, error.message, {
            code: error.code,
        });

    if (error instanceof DomainError)
        return send(res, error.status, error.message, {
            code: error.code,
        });

    if (error instanceof InfrastructureError)
        return send(res, error.status, error.message, {
            code: error.code,
        });

    if (error?.name === 'PrismaClientKnownRequestError') {
        switch (error.code) {
            case 'P2025':
                return send(res, 404, 'Registro no encontrado');
            case 'P2003':
                return send(res, 404, 'Fallo en Foreign Key');
            case 'P2002':
                return send(res, 409, 'Violación de restricción única');
            default:
                console.error(error);
                return send(res, 500, 'Error en la base de datos');
        }
    }

    if (error instanceof Error) {
        console.error('Unhandled error:', error);
        return send(res, 500, error.message);
    }

    console.error('Unknown error:', error);
    return send(res, 500, 'Error interno del servidor');
}

/* eslint-disable @typescript-eslint/no-explicit-any */

import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../errors/domain.error.js';
import { ValidationDTOError } from '../errors/validation.error.js';

// Utilidad para respuestas rápidas y consistentes
const send = (
    res: Response,
    status: number,
    message: string,
    extra: any = {},
) => res.status(status).json({ message, ...extra });

export function handleErrorMiddleware(
    error: any,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    if (res.headersSent) {
        return next(error);
    }

    // 1. Validaciones Zod
    //* -----------------------------
    if (error instanceof z.ZodError) {
        return send(res, 400, 'Error de validación', {
            code: 'VALIDATION_ERROR',
            errors: error.issues,
        });
    }
    // 2. Validaciones Zod (con ValidationDTOError)
    //* -----------------------------
    if (error instanceof ValidationDTOError) {
        return res.status(error.status).json({
            code: error.code,
            message: error.message,
            errors: error.errors,
        });
    }

    // 3. Errores de dominio (reglas de negocio)
    //* ----------------------------------------
    if (error instanceof DomainError) {
        return send(res, error.status, error.message, {
            code: error.code,
        });
    }

    // 4. Errores de Prisma (infraestructura)
    //* -------------------------------------
    if (error?.name === 'PrismaClientKnownRequestError') {
        switch (error.code) {
            case 'P2025':
                return send(res, 404, 'Registro no encontrado');
            case 'P2003':
                return send(res, 404, 'Fallo en Foreign Key', {
                    errors: error.meta,
                });
            case 'P2002':
                return send(res, 409, 'Violación de restricción única', {
                    errors: error.meta,
                });
            default:
                return send(
                    res,
                    500,
                    'Error en la base de datos:' + error.code,
                    {
                        errors: error.meta,
                    },
                );
        }
    }

    // 5. Errores estándar de JS
    //* -----------------------------
    if (error instanceof Error) {
        return send(res, 500, error.message);
    }

    // 6. Caso final (fallback)
    //* -----------------------------
    return send(res, 500, 'Error interno del servidor');
}

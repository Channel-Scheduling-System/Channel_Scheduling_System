import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ValidationDTOError } from '../errors/validation.error.js';

/**
 * **Validator factory to create zod DTO validator middlewares**
 * @param schema - Zod schema for validation
 * @param extractor - Function to extract data from request
 * @param setter - Function to set validated data back to request
 * @param validator - Optional custom validator function (for pre-validation checks)
 */
const createValidator = <T = unknown>(
    schema: z.ZodSchema<T>,
    extractor: (req: Request) => unknown,
    setter: (req: Request, data: T) => void,
    validator?: (req: Request) => void,
) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            validator?.(req);
            const result = schema.parse(extractor(req));
            setter(req, result);
            next();
        } catch (error) {
            if (error instanceof z.ZodError)
                next(new ValidationDTOError(z.treeifyError(error)));
            next(error);
        }
    };
};

export const validateBodyDTO = <T = unknown>(schema: z.ZodSchema<T>) => {
    return createValidator(
        schema,
        (req) => req.body,
        (req, data) => {
            req.body = data;
        },
    );
};

export const validateParamsDTO = <T = unknown>(schema: z.ZodSchema<T>) => {
    return createValidator(
        schema,
        (req) => req.params,
        (req, data) => {
            Object.assign(req.params, data as Record<string, unknown>);
        },
    );
};

export const validateQueryDTO = <T = unknown>(schema: z.ZodSchema<T>) => {
    return createValidator(
        schema,
        (req) => req.query,
        (req, data) => {
            Object.assign(req.query, data as Record<string, unknown>);
        },
    );
};

export const validateCookieDTO = <T = unknown>(
    cookieName: string,
    schema: z.ZodSchema<T>,
) => {
    return createValidator(
        schema,
        (req) => req.cookies?.[cookieName],
        (req, data) => {
            req.cookies[cookieName] = data;
        },
        (req) => {
            if (!req.cookies?.[cookieName])
                throw new ValidationDTOError({
                    [cookieName]: `Cookie "${cookieName}" es requerida`,
                });
        },
    );
};

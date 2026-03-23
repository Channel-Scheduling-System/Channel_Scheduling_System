import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ValidationDTOError } from '#/shared/errors/validation.error.js';

/**
 * Generic validator factory for Express middleware
 * Parses input using Zod schema and validates it
 * If validation fails, throws ValidationDTOError
 *
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
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Optional pre-validation (e.g., check if cookie exists)
            if (validator) {
                validator(req);
            }

            const dataToValidate = extractor(req);
            const result = schema.safeParse(dataToValidate);

            if (!result.success) {
                const errorTree = z.treeifyError(result.error);
                throw new ValidationDTOError(errorTree);
            }

            setter(req, result.data);
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Validates request body against schema
 * @example
 * router.post('/login', validateBodyDTO(loginSchema), controller.login)
 */
export const validateBodyDTO = <T = unknown>(schema: z.ZodSchema<T>) => {
    return createValidator(
        schema,
        (req) => req.body,
        (req, data) => {
            req.body = data;
        },
    );
};

/**
 * Validates query parameters against schema
 * @example
 * router.get('/search', validateQueryDTO(searchSchema), controller.search)
 */
export const validateQueryDTO = <T = unknown>(schema: z.ZodSchema<T>) => {
    return createValidator(
        schema,
        (req) => req.query,
        (req, data) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            req.query = data as Record<string, any>;
        },
    );
};

/**
 * Validates URL parameters/route params against schema
 * @example
 * router.get('/:id', validateParamsDTO(idSchema), controller.getOne)
 */
export const validateParamsDTO = <T = unknown>(schema: z.ZodSchema<T>) => {
    return createValidator(
        schema,
        (req) => req.params,
        (req, data) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            req.params = data as Record<string, any>;
        },
    );
};

/**
 * Validates specific cookie against schema
 * @example
 * router.get('/profile', validateCookieDTO('sessionId', sessionSchema), controller.profile)
 */
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
            if (!req.cookies?.[cookieName]) {
                throw new ValidationDTOError({
                    [cookieName]: `Cookie "${cookieName}" es requerida`,
                });
            }
        },
    );
};

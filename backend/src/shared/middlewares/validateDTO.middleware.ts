import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validateDTO = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = schema.safeParse(req.body);
            if (!result.success) {
                const errorTree = z.treeifyError(result.error);
                res.status(400).json({ errors: errorTree });
                return;
            }
            req.body = result.data;
            next();
        } catch (err) {
            next(err);
        }
    };
};

export const validateQueryDTO = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = schema.safeParse(req.query);
            if (!result.success) {
                const errorTree = z.treeifyError(result.error);
                res.status(400).json({ errors: errorTree });
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            req.query = result.data as any;
            next();
        } catch (err) {
            next(err);
        }
    };
};

export const validateParamsDTO = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = schema.safeParse(req.params);
            if (!result.success) {
                const errorTree = z.treeifyError(result.error);
                res.status(400).json({ errors: errorTree });
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            req.params = result.data as any;
            next();
        } catch (err) {
            next(err);
        }
    };
};

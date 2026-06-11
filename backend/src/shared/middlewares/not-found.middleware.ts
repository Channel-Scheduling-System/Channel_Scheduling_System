import { Request, Response } from 'express';

/**
 * **Not Found Middleware**
 * @description Handles 404 errors for undefined routes in Express
 */
export function notFoundMiddleware(req: Request, res: Response) {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.path,
        method: req.method,
    });
}

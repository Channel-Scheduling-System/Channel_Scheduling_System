import { Request, Response, NextFunction } from 'express';

export function requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
            res.status(403).json({
                message: 'No tienes permisos para esta acción.',
            });
            return;
        }
        next();
    };
}

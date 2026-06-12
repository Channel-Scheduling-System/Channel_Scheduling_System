import type { JwtPayload } from '../shared/types/jwt.js';

declare module 'express-serve-static-core' {
    interface Request {
        user?: JwtPayload;
    }
}

export {};

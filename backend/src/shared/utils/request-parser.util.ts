import type { Request } from 'express';
import type { SystemRole } from '../../modules/users/user.types.js';

export interface AuthContext {
    id: number;
    role: SystemRole;
}

export interface RequestContextWithId {
    id: number;
    auth: AuthContext;
}

export function extractAuthContext(req: Request): AuthContext {
    const id = req.user?.sub as unknown as number;
    const role = req.user?.role as SystemRole;
    return { id, role };
}

export function extractRequestContextWithId(
    req: Request,
): RequestContextWithId {
    const id = Number(req.params.id);
    const authId = req.user?.sub as unknown as number;
    const authRole = req.user?.role as SystemRole;

    return { id, auth: { id: authId, role: authRole } };
}

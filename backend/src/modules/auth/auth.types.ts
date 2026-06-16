import { JwtPayload } from '../../shared/types/jwt.js';
import {
    SystemRole,
    CreateUserInput,
    CreateUserData,
} from '../users/user.types.js';

export type { SystemRole };

export interface TokenGenParams {
    payload: JwtPayload;
    algorithm: string;
    secret: Uint8Array;
    audience: string;
    expiresIn: string;
}

export interface JwtPayloadWithExpiry extends JwtPayload {
    exp: number;
}

// ============================================================
// * PERSISTENCE MODELS
// ============================================================
export type { CreateUserData };

export interface CreateRefreshTokenData {
    userId: number;
    tokenHash: string;
    expireAt: Date;
}

// ============================================================
// * INPUTS
// ============================================================
export interface RegisterInput extends Omit<CreateUserInput, 'role'> {}

export interface LoginInput {
    identifier: string; // alias, email or phone
    password: string;
}

export interface LogoutInput {
    refreshToken: string;
    userId: number;
}

export interface RefreshTokenInput {
    refreshToken: string;
}

export interface VerifyResetCodeInput {
    email: string;
    code: string;
}

// ============================================================
// * RESPONSES
// ============================================================
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthUser {
    id: number;
    name: string;
    alias: string;
    role: SystemRole;
}

export interface AuthResult {
    user: AuthUser;
    tokens: AuthTokens;
}

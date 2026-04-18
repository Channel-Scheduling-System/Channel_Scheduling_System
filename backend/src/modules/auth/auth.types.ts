import {
    SystemRole,
    CreateUserInput,
    CreateUserData,
} from '../users/user.types.js';

export type { SystemRole };

// PERSISTENCE
//* -----------------------------
export type { CreateUserData };

// INPUTS
//* -----------------------------
export interface RegisterInput extends Omit<CreateUserInput, 'role'> {}

export interface LoginInput {
    identifier: string; // alias, email or phone
    password: string;
}

export interface LogoutInput {
    refreshToken: string;
    userId?: number; // Id extraído del JWT para validación adicional
}

export interface RefreshTokenInput {
    refreshToken: string;
}

// TOKENS
//* -----------------------------
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

// AUTH USER
//* -----------------------------
export interface AuthUser {
    id: number;
    name: string;
    alias: string;
    role: SystemRole;
}

// JWT
//* -----------------------------
export interface JwtPayload {
    sub: number;
    role: SystemRole;
}

// AUTH RESULT
//* -----------------------------
export interface AuthResult {
    user: AuthUser;
    tokens: AuthTokens;
}

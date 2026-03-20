export type SystemRole = 'ADMIN' | 'CLIENT' | 'WORKER';

// PERSISTENCE
//* -----------------------------
export interface CreateUserData {
    firstName: string;
    lastName: string;
    alias: string;
    phone?: string;
    email: string;
    passwordHash: string;
    role: SystemRole;
}

// INPUTS
//* -----------------------------
export interface LoginInput {
    identifier: string; // alias, email or phone
    password: string;
}

export interface RegisterInput {
    firstName: string;
    lastName: string;
    alias: string;
    email: string;
    phone?: string;
    password: string;
    role: SystemRole;
}

export interface RecoveryRequestInput {
    email: string;
}

export interface ResetPasswordInput {
    email: string;
    code: string;
    newPassword: string;
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
    token: string;
}

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
export interface RegisterInput {
    firstName: string;
    lastName: string;
    alias: string;
    email: string;
    phone?: string;
    password: string;
    role: SystemRole;
}

// AUTH USER
//* -----------------------------
export interface AuthUser {
    id: number;
    name: string;
    alias: string;
    role: SystemRole;
}

// AUTH RESULT
//* -----------------------------
export interface AuthResult {
    user: AuthUser;
    token: string;
}

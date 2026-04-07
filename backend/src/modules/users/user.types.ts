export type SystemRole = 'ADMIN' | 'CLIENT' | 'WORKER';

// ENTITY
export interface User {
    id: number;
    alias: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    email: string;
    passwordHash: string;
    role: SystemRole;
    mustChangePwd: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// PERSISTENCE
//* -----------------------------
export interface CreateUserData {
    alias: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email: string;
    passwordHash: string;
    role: SystemRole;
}

// INPUTS
//* -----------------------------
export interface AuthUserInput {
    id: number;
    role: SystemRole;
}

export interface CreateUserInput {
    alias: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email: string;
    password: string;
    role: SystemRole;
}

export interface CreateFirstAdminInput extends Omit<CreateUserInput, 'role'> {
    secretCode: string;
}

export interface UniqueFields {
    email?: string;
    alias?: string;
    phone?: string;
}

// USER RESPONSE
//* -----------------------------
export interface UserResponse {
    id: number;
    alias: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    email: string;
    role: SystemRole;
}

export interface UserFilters {
    role?: SystemRole;
}

import {
    Pagination,
    PaginationMeta,
} from '../../shared/types/pagination.types.js';

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
    resetVersion: number;
    isActive: boolean;
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

export interface UpdateUserData {
    alias?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
}

// INPUTS
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

export interface UpdateUserInput {
    id: number;
    alias?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
}

export interface UpdatePasswordInput {
    id: number;
    password: string;
    newPassword: string;
}

export interface UpdateStateInput {
    id: number;
    isActive: boolean;
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
    email: string;
    phone: string | null;
    role: SystemRole;
    isActive: boolean;
}

export interface PaginatedUserResponse {
    data: UserResponse[];
    meta: PaginationMeta;
}

// FILTERS

export interface UserFilters {
    role?: SystemRole[];
    isActive?: boolean;
    identifier?: string;
}

export interface UserQuery extends UserFilters, Pagination {}

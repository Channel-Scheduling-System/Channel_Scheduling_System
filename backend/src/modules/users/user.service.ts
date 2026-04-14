import bcrypt from 'bcrypt';

import { env } from '../../config/env.js';
import {
    ConflictError,
    NotFoundError,
} from '../../shared/errors/domain.error.js';
import { InvalidCredentialsError } from '../../shared/errors/validation.error.js';

import { IUserRepository } from './user.repository.js';

import {
    SystemRole,
    User,
    UniqueFields,
    CreateUserInput,
    UserFilters,
    UserPagination,
    UserResponse,
    CreateFirstAdminInput,
    PaginatedUserResponse,
    AuthUserInput as AuthInput,
} from './user.types.js';
import { mapToUserResponse, mapToUsersResponse } from './user.mapper.js';
import {
    canCreate,
    canView,
    getViewableRoles,
    validateRolePermission,
    type AuthContext,
    type TargetUser,
} from './user-role.validator.js';
import { USER_ERRORS } from '../../shared/constants/messages.js';

export interface IUserService {
    add(input: CreateUserInput, authRole?: SystemRole): Promise<UserResponse>;
    addFirstAdmin(input: CreateFirstAdminInput): Promise<UserResponse>;
    existsByIdAndRole(id: number, role: SystemRole): Promise<boolean>;
    getById(id: number, auth?: AuthInput): Promise<UserResponse>;
    getByIdentifier(identifier: string): Promise<User | null>;
    getAll(
        pagination: UserPagination,
        filters: UserFilters,
        authRole?: SystemRole,
    ): Promise<PaginatedUserResponse>;
    countAdmins(): Promise<number>;
}

const SALT_ROUNDS = 10;

export class UserService implements IUserService {
    constructor(private readonly userRepo: IUserRepository) {}

    async add(
        input: CreateUserInput,
        authRole?: SystemRole,
    ): Promise<UserResponse> {
        if (authRole) this.validateCanCreate(authRole, input.role);

        await this.validateUniqueFields(input);

        const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
        const { password: _password, ...userData } = input;

        const newUser = await this.userRepo.create({
            ...userData,
            passwordHash,
        });
        return mapToUserResponse(newUser);
    }

    async addFirstAdmin(input: CreateFirstAdminInput): Promise<UserResponse> {
        // Validar que no exista admin
        const adminCount = await this.userRepo.countAdmins();
        if (adminCount > 0) throw new ConflictError(USER_ERRORS.ADMIN_EXISTS);
        // Validar código de primer admin
        if (input.secretCode !== env.firstAdminSecretCode) {
            throw new InvalidCredentialsError(
                USER_ERRORS.FIRST_ADMIN_CODE_INVALID,
            );
        }
        const { secretCode: _secretCode, ...userData } = input;
        return await this.add({ role: 'ADMIN', ...userData });
    }

    async existsByIdAndRole(id: number, role: SystemRole): Promise<boolean> {
        return this.userRepo.existsByIdAndRole(id, role);
    }

    async getById(id: number, auth?: AuthInput): Promise<UserResponse> {
        const user = await this.getUserOrFail(id);
        if (auth) this.validateCanView(auth, { id: user.id, role: user.role });
        return mapToUserResponse(user);
    }

    async getByIdentifier(identifier: string): Promise<User | null> {
        return this.userRepo.findByIdentifier(identifier);
    }

    async getAll(
        pagination: UserPagination,
        filters: UserFilters,
        authRole?: SystemRole,
    ): Promise<PaginatedUserResponse> {
        const filtersByRole = this.buildFiltersByRole(filters, authRole);
        const { data, total } = await this.userRepo.findAll(
            pagination,
            filtersByRole,
        );

        const limit = pagination.limit || 10;
        const page = Math.max(1, pagination.page || 1);
        const totalPages = Math.ceil(total / limit);

        return {
            data: mapToUsersResponse(data),
            meta: { total, page, limit, totalPages },
        };
    }

    private buildFiltersByRole(
        filters: UserFilters,
        authRole?: SystemRole,
    ): UserFilters {
        if (!authRole) return filters;
        const viewableRoles = getViewableRoles(authRole);
        // Si no se especifican roles, limitar a los roles permitidos
        if (!filters.role || filters.role.length === 0) {
            return { ...filters, role: viewableRoles };
        }
        // Si se especifican roles, los intersecta con los roles permitidos
        const allowedRoles = filters.role.filter((role) =>
            viewableRoles.includes(role),
        );
        return {
            ...filters,
            role: allowedRoles.length > 0 ? allowedRoles : viewableRoles,
        };
    }

    async countAdmins(): Promise<number> {
        return this.userRepo.countAdmins();
    }

    private async getUserOrFail(id: number): Promise<User> {
        const user = await this.userRepo.findById(id);
        if (!user) throw new NotFoundError(USER_ERRORS.ID_NOTFOUND);
        return user;
    }

    // VALIDACIONES DE NEGOCIO Y PERMISOS
    //* -----------------------------

    private async validateUniqueFields(
        input: UniqueFields,
        currentUser?: User,
    ): Promise<void> {
        const [aliasExists, emailExists, phoneExists] = await Promise.all([
            input.alias && input.alias !== currentUser?.alias
                ? this.userRepo.existsByAlias(input.alias)
                : false,
            input.email && input.email !== currentUser?.email
                ? this.userRepo.existsByEmail(input.email)
                : false,
            input.phone && input.phone !== currentUser?.phone
                ? this.userRepo.existsByPhone(input.phone)
                : false,
        ]);

        if (aliasExists) throw new ConflictError(USER_ERRORS.ALIAS_REGISTERED);
        if (emailExists) throw new ConflictError(USER_ERRORS.EMAIL_REGISTERED);
        if (phoneExists) throw new ConflictError(USER_ERRORS.PHONE_REGISTERED);
    }

    private validateCanCreate(
        authRole: SystemRole,
        targetRole: SystemRole,
    ): void {
        validateRolePermission(
            canCreate(authRole, targetRole),
            USER_ERRORS.ROLE_CANNOT_CREATE,
        );
    }

    private validateCanView(auth: AuthContext, target: TargetUser): void {
        validateRolePermission(
            canView(auth, target),
            USER_ERRORS.ROLE_CANNOT_VIEW,
        );
    }
}

import bcrypt from 'bcrypt';

import { env } from '../../config/env.js';
import {
    ConflictError,
    NotFoundError,
} from '../../shared/errors/domain.error.js';
import { InvalidCredentialsError } from '../../shared/errors/validation.error.js';

import { IUserRepository } from './user.repository.js';
import { IAuthRepository } from '../auth/auth.repository.js';

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
    UpdatePasswordInput,
    UpdateUserInput,
    UpdateStateInput,
} from './user.types.js';
import { mapToUserResponse, mapToUsersResponse } from './user.mapper.js';
import {
    canCreate,
    canUpdate,
    canUpdatePassword,
    canUpdateState,
    canView,
    getViewableRoles,
    validateRolePermission,
    type AuthContext,
    type TargetUser,
} from './user-role.validator.js';
import { USER_ERRORS } from '../../shared/constants/messages.js';

export interface IUserService {
    add(input: CreateUserInput, auth?: AuthContext): Promise<UserResponse>;
    addFirstAdmin(input: CreateFirstAdminInput): Promise<UserResponse>;
    existsByIdAndRole(id: number, role: SystemRole): Promise<boolean>;
    getById(id: number, auth?: AuthContext): Promise<UserResponse>;
    getByEmail(email: string): Promise<User | null>;
    getByIdentifier(identifier: string): Promise<User | null>;
    getAll(
        pagination: UserPagination,
        filters: UserFilters,
        authRole?: SystemRole,
    ): Promise<PaginatedUserResponse>;
    update(input: UpdateUserInput, auth?: AuthContext): Promise<UserResponse>;
    updatePassword(
        input: UpdatePasswordInput,
        auth?: AuthContext,
    ): Promise<void>;
    updateState(input: UpdateStateInput, auth?: AuthContext): Promise<boolean>;
    deactivateMe(password: string, auth: AuthContext): Promise<void>;
    countAdmins(): Promise<number>;
}

const SALT_ROUNDS = 10;

export class UserService implements IUserService {
    constructor(
        private readonly userRepo: IUserRepository,
        private readonly authRepo: IAuthRepository,
    ) {}

    async add(
        input: CreateUserInput,
        auth?: AuthContext,
    ): Promise<UserResponse> {
        if (auth) this.validateCanCreate(auth, { id: 0, role: input.role });

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

    async getById(id: number, auth?: AuthContext): Promise<UserResponse> {
        const user = await this.getUserOrFail(id, true);
        if (auth)
            this.validateCanView(auth, {
                id: user.id,
                role: user.role,
                isActive: user.isActive,
            });
        return mapToUserResponse(user);
    }

    async getByEmail(email: string): Promise<User | null> {
        return this.userRepo.findByEmail(email);
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
        // Clientes solo ven usuarios activos
        if (authRole === 'CLIENT') filters.isActive = true;
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

    async update(
        input: UpdateUserInput,
        auth?: AuthContext,
    ): Promise<UserResponse> {
        const user = await this.getUserOrFail(input.id);
        if (auth)
            this.validateCanUpdate(auth, { id: user.id, role: user.role });

        await this.validateUniqueFields(input, user);
        const updated = await this.userRepo.update(input.id, input);
        return mapToUserResponse(updated);
    }

    async updatePassword(
        input: UpdatePasswordInput,
        auth?: AuthContext,
    ): Promise<void> {
        const user = await this.getUserOrFail(input.id);
        if (auth)
            this.validateCanUpdatePassword(auth, {
                id: user.id,
                role: user.role,
            });

        await this.validatePassword(input.password, user.passwordHash);

        const newHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
        await this.userRepo.updatePassword(input.id, newHash);
    }

    async updateState(
        input: UpdateStateInput,
        auth?: AuthContext,
    ): Promise<boolean> {
        const user = await this.getUserOrFail(input.id, true);
        if (auth)
            this.validateCanUpdateState(auth, {
                id: user.id,
                role: user.role,
            });
        await this.userRepo.updateIsActive(input.id, input.isActive);

        if (!input.isActive)
            await this.authRepo.deleteRefreshTokensForUser(input.id);

        return input.isActive;
    }

    async deactivateMe(password: string, auth: AuthContext): Promise<void> {
        const user = await this.getUserOrFail(auth.id);
        await this.validatePassword(password, user.passwordHash);
        await this.userRepo.updateIsActive(auth.id, false);
        await this.authRepo.deleteRefreshTokensForUser(auth.id);
    }

    async countAdmins(): Promise<number> {
        return this.userRepo.countAdmins();
    }

    private async getUserOrFail(
        id: number,
        includeInactive: boolean = false,
    ): Promise<User> {
        const user = await this.userRepo.findById(id);
        if (!user) throw new NotFoundError(USER_ERRORS.NOT_FOUND);
        if (includeInactive === false && !user.isActive)
            throw new NotFoundError(USER_ERRORS.NOT_FOUND);
        return user;
    }

    // VALIDACIONES DE NEGOCIO Y PERMISOS
    //* -----------------------------

    private async validatePassword(
        plainPassword: string,
        passwordHash: string,
    ): Promise<void> {
        const isValid = await bcrypt.compare(plainPassword, passwordHash);
        if (!isValid) throw new InvalidCredentialsError();
    }

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

    private validateCanCreate(auth: AuthContext, target: TargetUser): void {
        validateRolePermission(
            canCreate(auth, target),
            USER_ERRORS.ROLE_CANNOT_CREATE,
        );
    }

    private validateCanView(auth: AuthContext, target: TargetUser): void {
        if (auth.role === 'CLIENT' && !target.isActive) {
            throw new NotFoundError(USER_ERRORS.NOT_FOUND);
        }
        validateRolePermission(
            canView(auth, target),
            USER_ERRORS.ROLE_CANNOT_VIEW,
        );
    }

    private validateCanUpdate(auth: AuthContext, target: TargetUser): void {
        validateRolePermission(
            canUpdate(auth, target),
            USER_ERRORS.ROLE_CANNOT_UPDATE,
        );
    }

    private validateCanUpdatePassword(
        auth: AuthContext,
        target: TargetUser,
    ): void {
        validateRolePermission(
            canUpdatePassword(auth, target),
            USER_ERRORS.ROLE_CANNOT_UPDATE_PASSWORD,
        );
    }

    private validateCanUpdateState(
        auth: AuthContext,
        target: TargetUser,
    ): void {
        validateRolePermission(
            canUpdateState(auth, target),
            USER_ERRORS.ROLE_CANNOT_UPDATE_STATE,
        );
    }
}

import bcrypt from 'bcrypt';

import { env } from '../../config/env.js';
import {
    ConflictError,
    NotFoundError,
    ForbiddenError,
} from '#/shared/errors/domain.error.js';
import { InvalidCredentialsError } from '#/shared/errors/validation.error.js';

import { IUserRepository } from './user.repository.js';

import {
    SystemRole,
    User,
    UniqueFields,
    CreateUserInput,
    UserFilters,
    UserResponse,
    CreateFirstAdminInput,
    AuthUserInput as AuthInput,
} from './user.types.js';
import { mapToUserResponse, mapToUsersResponse } from './user.mapper.js';
import { canCreateRole, canViewRole } from './user-role.validator.js';

export interface IUserService {
    add(input: CreateUserInput, authRole?: SystemRole): Promise<UserResponse>;
    addFirstAdmin(input: CreateFirstAdminInput): Promise<UserResponse>;
    existsByIdAndRole(id: number, role: SystemRole): Promise<boolean>;
    getById(id: number, auth?: AuthInput): Promise<UserResponse>;
    getByIdentifier(identifier: string): Promise<User | null>;
    getAll(filters: UserFilters, auth?: AuthInput): Promise<UserResponse[]>;
    countAdmins(): Promise<number>;
}

const SALT_ROUNDS = 10;

const USER_ERRORS = {
    ROLE_CANNOT_CREATE: 'No tienes permisos para crear este tipo de usuario',
    ROLE_CANNOT_VIEW: 'No tienes permisos para ver este tipo de usuario',
    FIRST_ADMIN_CODE_INVALID: 'Código secreto para primer admin inválido',
    ADMIN_EXISTS: 'Ya existe un administrador en el sistema',
    EMAIL_REGISTERED: 'El email ya está registrado',
    ALIAS_REGISTERED: 'El alias ya está registrado',
    PHONE_REGISTERED: 'El teléfono ya está registrado',
    ID_NOTFOUND: 'El usuario con el id solicitado no existe',
    IDENTIFIER_NOTFOUND:
        'No se encontró un usuario con el identificador proporcionado',
} as const;

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
        if (auth?.role) this.validateCanView(auth.role, user.role, auth.id, id);
        return mapToUserResponse(user);
    }

    async getByIdentifier(identifier: string): Promise<User | null> {
        return this.userRepo.findByIdentifier(identifier);
    }

    async getAll(
        filters: UserFilters,
        auth?: AuthInput,
    ): Promise<UserResponse[]> {
        const allUsers = await this.userRepo.findAll(filters);

        if (!auth?.role) return mapToUsersResponse(allUsers);

        const visibleUsers = allUsers.filter((user) =>
            canViewRole(auth.role, user.role, auth.id, user.id),
        );

        return mapToUsersResponse(visibleUsers);
    }

    async countAdmins(): Promise<number> {
        return this.userRepo.countAdmins();
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

    private async getUserOrFail(id: number): Promise<User> {
        const user = await this.userRepo.findById(id);
        if (!user) throw new NotFoundError(USER_ERRORS.ID_NOTFOUND);
        return user;
    }

    private validateCanCreate(authRole: SystemRole, roleToCreate: SystemRole) {
        if (!canCreateRole(authRole, roleToCreate))
            throw new ForbiddenError(USER_ERRORS.ROLE_CANNOT_CREATE);
    }

    private validateCanView(
        authRole: SystemRole,
        roleToView: SystemRole,
        authUserId?: number,
        userIdToView?: number,
    ) {
        if (!canViewRole(authRole, roleToView, authUserId, userIdToView))
            throw new ForbiddenError(USER_ERRORS.ROLE_CANNOT_VIEW);
    }

    // TODO: Faltan restricciones de role para update y delete
}

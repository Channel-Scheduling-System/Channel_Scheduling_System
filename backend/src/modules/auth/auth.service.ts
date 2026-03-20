import bcrypt from 'bcrypt';

import { ConflictError } from '#/shared/errors/domain.error.js';
import { IAuthRepository } from './auth.repository.js';

import { AuthResult, RegisterInput } from './auth.types.js';

export interface IAuthService {
    register(input: RegisterInput): Promise<AuthResult>;
}

const SALT_ROUNDS = 10;

export class AuthService implements IAuthService {
    constructor(private readonly authRepo: IAuthRepository) {}

    async register(input: RegisterInput): Promise<AuthResult> {
        const existingUser = await this.authRepo.findUserByEmail(input.email);
        if (existingUser)
            throw new ConflictError('El email ya está registrado');
        const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
        const { password: _password, ...rest } = input;
        const user = await this.authRepo.createUser({
            ...rest,
            passwordHash,
        });
        return {
            user: {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                alias: user.alias,
                role: user.role,
            },
            token: 'token-placeholder',
        };
    }
}

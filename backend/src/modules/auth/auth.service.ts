import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { env } from '#/config/env.js';
import {
    ConflictError,
    InvalidCredentialsError,
} from '#/shared/errors/domain.error.js';
import { IAuthRepository } from './auth.repository.js';

import {
    AuthResult,
    JwtPayload,
    LoginInput,
    RegisterInput,
} from './auth.types.js';

export interface IAuthService {
    login(input: LoginInput): Promise<AuthResult>;
    register(input: RegisterInput): Promise<AuthResult>;
}

const SALT_ROUNDS = 10;

export class AuthService implements IAuthService {
    constructor(private readonly authRepo: IAuthRepository) {}

    async login(input: LoginInput): Promise<AuthResult> {
        const user = await this.authRepo.findUserByIdentifier(input.identifier);
        if (!user) throw new InvalidCredentialsError();
        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValid) throw new InvalidCredentialsError();
        const token = this.generateToken({
            sub: user.id,
            role: user.role,
        });
        return {
            user: {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                alias: user.alias,
                role: user.role,
            },
            token: token.accessToken,
        };
    }

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
        const token = this.generateToken({
            sub: user.id,
            role: user.role,
        });
        return {
            user: {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                alias: user.alias,
                role: user.role,
            },
            token: token.accessToken,
        };
    }

    private generateToken(payload: JwtPayload) {
        const accessToken = jwt.sign(payload, env.jwt.secret, {
            expiresIn: '15m',
        });
        return {
            accessToken,
        };
    }
}

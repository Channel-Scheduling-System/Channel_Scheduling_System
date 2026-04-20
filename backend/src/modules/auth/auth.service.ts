import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { env } from '../../config/env.js';
import {
    UnauthorizedError,
    TokenReuseError,
} from '../../shared/errors/domain.error.js';
import {
    InvalidCredentialsError,
    InvalidTokenError,
} from '../../shared/errors/validation.error.js';
import { IAuthRepository } from './auth.repository.js';
import { mapToAuthUser } from './auth.mapper.js';

import {
    AuthResult,
    AuthTokens,
    JwtPayload,
    LoginInput,
    LogoutInput,
    RefreshTokenInput,
    RegisterInput,
    SystemRole,
} from './auth.types.js';
import { IUserService } from '../users/user.service.js';
import { AUTH_ERRORS, USER_ERRORS } from '#/shared/constants/messages.js';

export interface IAuthService {
    register(input: RegisterInput): Promise<AuthResult>;
    login(input: LoginInput): Promise<AuthResult>;
    refresh(input: RefreshTokenInput): Promise<AuthResult>;
    logout(input: LogoutInput): Promise<void>;
    checkAdminExists(): Promise<boolean>;
}

const TOKEN_HASH_ALGORITHM = 'sha256';

export class AuthService implements IAuthService {
    constructor(
        private readonly authRepo: IAuthRepository,
        private readonly userService: IUserService,
    ) {}

    async register(input: RegisterInput): Promise<AuthResult> {
        const user = await this.userService.add({ ...input, role: 'CLIENT' });
        const tokens = await this.generateAndStoreTokens(user.id, user.role);

        return {
            user: mapToAuthUser(user),
            tokens,
        };
    }

    async login(input: LoginInput): Promise<AuthResult> {
        const user = await this.userService.getByIdentifier(input.identifier);
        if (!user) throw new InvalidCredentialsError();
        if (!user.isActive) throw new UnauthorizedError(USER_ERRORS.USER_DEACTIVATED);

        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValid) throw new InvalidCredentialsError();

        await this.authRepo.deleteRefreshTokensForUser(user.id);
        const tokens = await this.generateAndStoreTokens(user.id, user.role);

        return {
            user: mapToAuthUser(user),
            tokens,
        };
    }

    async refresh(input: RefreshTokenInput): Promise<AuthResult> {
        await this.verifyRefreshToken(input.refreshToken);
        const payload = this.decodeRefreshToken(input.refreshToken);

        const tokenHash = this.hashToken(input.refreshToken);
        const storedToken = await this.authRepo.findRefreshToken(tokenHash);

        if (!storedToken) {
            await this.authRepo.deleteRefreshTokensForUser(payload.sub);
            throw new TokenReuseError(AUTH_ERRORS.TOKEN_REUSE_DETECTED);
        }

        const user = await this.userService.getById(payload.sub);
        if (!user) throw new UnauthorizedError(AUTH_ERRORS.USER_NOT_FOUND);
        if (!user.isActive) throw new UnauthorizedError(USER_ERRORS.USER_DEACTIVATED);

        await this.authRepo.invalidateRefreshToken(tokenHash);
        const tokens = await this.generateAndStoreTokens(user.id, user.role);

        return {
            user: mapToAuthUser(user),
            tokens,
        };
    }

    async logout(input: LogoutInput): Promise<void> {
        // Verifica validez del token
        await this.verifyRefreshToken(input.refreshToken);
        const payload = this.decodeRefreshToken(input.refreshToken);
        // Verifica que el token corresponde al id de usuario proporcionado
        if (input.userId && input.userId !== payload.sub)
            throw new UnauthorizedError(AUTH_ERRORS.LOGOUT_UNAUTHORIZED);
        // Verifica que el token existe y no ha sido revocado
        const tokenHash = this.hashToken(input.refreshToken);
        const storedToken = await this.authRepo.findRefreshToken(tokenHash);
        if (!storedToken)
            throw new UnauthorizedError(AUTH_ERRORS.LOGOUT_INVALID_TOKEN);
        // Verifica que el token pertenece al usuario que intenta cerrar sesión
        if (storedToken.userId !== payload.sub)
            throw new UnauthorizedError(AUTH_ERRORS.LOGOUT_UNAUTHORIZED);

        await this.authRepo.invalidateRefreshToken(tokenHash);
    }

    async checkAdminExists(): Promise<boolean> {
        const count = await this.userService.countAdmins();
        return count > 0;
    }

    private async generateAndStoreTokens(
        userId: number,
        role: SystemRole,
    ): Promise<AuthTokens> {
        const payload: JwtPayload = {
            sub: userId,
            role,
        };

        const accessToken = await this.generateAccessToken(payload);
        const refreshToken = await this.generateRefreshToken(payload);

        const expireAt = this.extractTokenExpiration(refreshToken);
        const tokenHash = this.hashToken(refreshToken);

        await this.authRepo.createRefreshToken(userId, tokenHash, expireAt);

        return {
            accessToken,
            refreshToken,
        };
    }

    private async generateAccessToken(payload: JwtPayload): Promise<string> {
        const secret = new TextEncoder().encode(env.jwt.secret);
        const token = await new SignJWT({
            sub: payload.sub.toString(),
            role: payload.role,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime(env.jwt.expiresIn)
            .sign(secret);
        return token;
    }

    private async generateRefreshToken(payload: JwtPayload): Promise<string> {
        const secret = new TextEncoder().encode(env.jwt.refresh);
        const token = await new SignJWT({
            sub: payload.sub.toString(),
            role: payload.role,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime(env.jwt.expiresInRefresh)
            .sign(secret);
        return token;
    }

    private decodeRefreshToken(token: string): JwtPayload & { exp?: number } {
        // Decodificar sin verificar para obtener claims
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new InvalidTokenError();
        }
        try {
            const decoded = JSON.parse(
                Buffer.from(parts[1], 'base64').toString('utf-8'),
            ) as { sub: string; role: string; exp?: number };
            return {
                sub: parseInt(decoded.sub, 10),
                role: decoded.role as SystemRole,
                exp: decoded.exp,
            };
        } catch {
            throw new InvalidTokenError(AUTH_ERRORS.TOKEN_DECODE_FAILED);
        }
    }

    private async verifyRefreshToken(token: string): Promise<void> {
        try {
            const secret = new TextEncoder().encode(env.jwt.refresh);
            await jwtVerify(token, secret);
        } catch {
            throw new InvalidTokenError();
        }
    }

    private extractTokenExpiration(token: string): Date {
        const payload = this.decodeRefreshToken(token);
        if (!payload.exp) {
            throw new InvalidTokenError(AUTH_ERRORS.TOKEN_DECODE_FAILED);
        }
        return new Date(payload.exp * 1000);
    }

    private hashToken(token: string): string {
        return crypto
            .createHash(TOKEN_HASH_ALGORITHM)
            .update(token)
            .digest('hex');
    }
}

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { SignJWT } from 'jose';
import { env } from '../../config/env.js';
import {
    UnauthorizedError,
    TokenReuseError,
} from '../../shared/errors/domain.error.js';
import {
    InvalidCredentialsError,
    InvalidTokenError,
} from '../../shared/errors/validation.error.js';

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
    VerifyResetCodeInput,
} from './auth.types.js';

import { IAuthRepository } from './auth.repository.js';
import { IUserService } from '../users/user.service.js';
import { IResetCodeService } from '../reset-codes/reset-code.service.js';
import { AUTH_ERRORS, USER_ERRORS } from '../../shared/constants/messages.js';
import { verifyJwt } from '../../shared/utils/jwt.util.js';

export interface IAuthService {
    register(input: RegisterInput): Promise<AuthResult>;
    login(input: LoginInput): Promise<AuthResult>;
    refresh(input: RefreshTokenInput): Promise<AuthResult>;
    logout(input: LogoutInput): Promise<void>;
    requestPasswordReset(email: string): Promise<void>;
    verifyResetCode(input: VerifyResetCodeInput): Promise<string>;
    resetPassword(userId: number, newPassword: string): Promise<void>;
    checkAdminExists(): Promise<boolean>;
}

const REFRESH_SECRET = new TextEncoder().encode(env.jwt.refresh);
const REFRESH_AUDIENCE = 'refresh';
const TOKEN_HASH_ALGORITHM = 'sha256';
const AUTH_EMAIL_NOT_FOUND_DELAY_MS = 2500;

export class AuthService implements IAuthService {
    constructor(
        private readonly authRepo: IAuthRepository,
        private readonly userService: IUserService,
        private readonly resetCodeService: IResetCodeService,
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
        if (!user.isActive)
            throw new UnauthorizedError(USER_ERRORS.USER_DEACTIVATED);

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
        const payload = await this.verifyRefreshToken(input.refreshToken);

        const tokenHash = this.hashToken(input.refreshToken);
        const storedToken = await this.authRepo.findRefreshToken(tokenHash);

        if (!storedToken) {
            await this.authRepo.deleteRefreshTokensForUser(payload.sub);
            throw new TokenReuseError(AUTH_ERRORS.TOKEN_REUSE_DETECTED);
        }

        const user = await this.userService.getById(payload.sub);
        if (!user) throw new UnauthorizedError(USER_ERRORS.NOT_FOUND);
        if (!user.isActive)
            throw new UnauthorizedError(USER_ERRORS.USER_DEACTIVATED);

        await this.authRepo.invalidateRefreshToken(tokenHash);
        const tokens = await this.generateAndStoreTokens(user.id, user.role);

        return {
            user: mapToAuthUser(user),
            tokens,
        };
    }

    async logout(input: LogoutInput): Promise<void> {
        // Verifica validez e integridad del token
        const payload = await this.verifyRefreshToken(input.refreshToken);
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

    async requestPasswordReset(email: string): Promise<void> {
        const user = await this.userService.getByEmail(email);
        if (!user || !user.isActive)
            return await new Promise((resolve) =>
                setTimeout(resolve, AUTH_EMAIL_NOT_FOUND_DELAY_MS),
            );

        await this.resetCodeService.generateAndSend({
            userId: user.id,
            email,
        });
    }

    async verifyResetCode(input: VerifyResetCodeInput): Promise<string> {
        const user = await this.userService.getByEmail(input.email);
        if (!user || !user.isActive) throw new InvalidCredentialsError();

        try {
            await this.resetCodeService.verifyCode(user.id, input.code);
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Reset code validation failed: ${error.message}`);
            }
            throw new InvalidCredentialsError();
        }

        return await this.generateResetToken(user.id);
    }

    async resetPassword(userId: number, newPassword: string): Promise<void> {
        await this.userService.resetPasswordDirect(userId, newPassword);
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

        const expireAt = await this.extractTokenExpiration(refreshToken);
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
            .setAudience('access')
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
            .setAudience('refresh')
            .setExpirationTime(env.jwt.expiresInRefresh)
            .sign(secret);
        return token;
    }

    private async generateResetToken(userId: number): Promise<string> {
        const secret = new TextEncoder().encode(env.jwt.resetPass);
        const token = await new SignJWT()
            .setProtectedHeader({ alg: 'HS256' })
            .setSubject(userId.toString())
            .setAudience('password-reset')
            .setExpirationTime(env.jwt.expiresInResetPass)
            .sign(secret);
        return token;
    }

    private async verifyRefreshToken(token: string): Promise<JwtPayload> {
        try {
            const payload = await verifyJwt(token, {
                secret: REFRESH_SECRET,
                audience: REFRESH_AUDIENCE,
                errorMessages: {
                    expired: AUTH_ERRORS.REFRESH_TOKEN_EXPIRED,
                    invalid: AUTH_ERRORS.REFRESH_TOKEN_INVALID,
                },
            });
            return {
                sub: Number(payload.sub),
                role: String(payload['role']) as SystemRole,
            };
        } catch (error) {
            if (
                error instanceof InvalidTokenError &&
                error.message === AUTH_ERRORS.REFRESH_TOKEN_EXPIRED
            ) {
                return this.decodeExpiredToken(token);
            }
            throw error;
        }
    }

    private decodeExpiredToken(token: string): JwtPayload {
        const parts = token.split('.');
        if (parts.length !== 3)
            throw new InvalidTokenError(AUTH_ERRORS.REFRESH_TOKEN_INVALID);
        try {
            const payloadJson = this.base64UrlDecode(parts[1]);
            const decoded = JSON.parse(payloadJson) as {
                sub?: string;
                role?: string;
            };
            if (!decoded.sub)
                throw new InvalidTokenError(AUTH_ERRORS.REFRESH_TOKEN_INVALID);
            return {
                sub: Number(decoded.sub),
                role: String(decoded.role) as SystemRole,
            };
        } catch {
            throw new InvalidTokenError(AUTH_ERRORS.REFRESH_TOKEN_INVALID);
        }
    }

    private async extractTokenExpiration(token: string): Promise<Date> {
        const parts = token.split('.');
        if (parts.length !== 3) throw new InvalidTokenError();

        try {
            const payloadJson = this.base64UrlDecode(parts[1]);
            const decoded = JSON.parse(payloadJson) as { exp?: number };
            if (!decoded.exp)
                throw new InvalidTokenError(AUTH_ERRORS.TOKEN_DECODE_FAILED);
            return new Date(decoded.exp * 1000);
        } catch {
            throw new InvalidTokenError(AUTH_ERRORS.TOKEN_DECODE_FAILED);
        }
    }

    private base64UrlDecode(str: string): string {
        let s = str.replace(/-/g, '+').replace(/_/g, '/');
        const pad = s.length % 4;
        if (pad === 2) s += '==';
        else if (pad === 3) s += '=';
        else if (pad === 1) s += '===';
        return Buffer.from(s, 'base64').toString('utf-8');
    }

    private hashToken(token: string): string {
        return crypto
            .createHmac(TOKEN_HASH_ALGORITHM, env.token.secret)
            .update(token)
            .digest('hex');
    }
}

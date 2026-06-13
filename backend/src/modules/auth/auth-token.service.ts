import { SignJWT } from 'jose';
import { IAuthRepository } from './auth.repository.js';
import {
    AuthTokens,
    JwtPayloadWithExpiry,
    TokenGenParams,
} from './auth.types.js';
import { JwtConfig, TOKEN_EXPIRATION } from './utils/jwt-config.util.js';
import { hashToken } from './utils/token-hasher.util.js';
import { decodeJwtPayload } from './utils/token-decoder.util.js';
import { InvalidTokenError } from '../../shared/errors/validation.error.js';
import { AUTH_ERRORS } from '../../shared/constants/messages.js';
import { verifyJwt } from '../../shared/utils/jwt.util.js';
import { JwtPayload } from '../../shared/types/jwt.js';

export interface IAuthTokenService {
    generateAndStoreTokens(userId: number, role: string): Promise<AuthTokens>;
    generateAccessToken(payload: JwtPayload): Promise<string>;
    generateRefreshToken(payload: JwtPayload): Promise<string>;
    generateResetToken(userId: number): Promise<string>;
    verifyRefreshToken(token: string): Promise<JwtPayload>;
}

export class AuthTokenService implements IAuthTokenService {
    constructor(private readonly authRepo: IAuthRepository) {}

    async generateAndStoreTokens(
        userId: number,
        role: string,
    ): Promise<AuthTokens> {
        const payload: JwtPayload = { sub: userId, role };

        const accessToken = await this.generateAccessToken(payload);
        const refreshToken = await this.generateRefreshToken(payload);

        const expireAt = this.extractExpiration(refreshToken);
        const tokenHash = hashToken(refreshToken);

        await this.authRepo.createRefreshToken({
            userId,
            tokenHash,
            expireAt,
        });

        return { accessToken, refreshToken };
    }

    async generateAccessToken(payload: JwtPayload): Promise<string> {
        return this.generateToken({
            payload,
            algorithm: JwtConfig.ACCESS.algorithm,
            secret: JwtConfig.ACCESS.secret,
            audience: JwtConfig.ACCESS.audience,
            expiresIn: TOKEN_EXPIRATION.ACCESS,
        });
    }

    async generateRefreshToken(payload: JwtPayload): Promise<string> {
        return this.generateToken({
            payload,
            algorithm: JwtConfig.REFRESH.algorithm,
            secret: JwtConfig.REFRESH.secret,
            audience: JwtConfig.REFRESH.audience,
            expiresIn: TOKEN_EXPIRATION.REFRESH,
        });
    }

    async generateResetToken(userId: number): Promise<string> {
        return this.generateToken({
            payload: { sub: userId, role: '' },
            algorithm: JwtConfig.RESET_PASS.algorithm,
            secret: JwtConfig.RESET_PASS.secret,
            audience: JwtConfig.RESET_PASS.audience,
            expiresIn: TOKEN_EXPIRATION.RESET_PASS,
        });
    }

    async verifyRefreshToken(token: string): Promise<JwtPayload> {
        try {
            const payload = await verifyJwt(token, {
                secret: JwtConfig.REFRESH.secret,
                audience: JwtConfig.REFRESH.audience,
                errorMessages: {
                    expired: AUTH_ERRORS.REFRESH_TOKEN_EXPIRED,
                    invalid: AUTH_ERRORS.REFRESH_TOKEN_INVALID,
                },
            });

            return {
                sub: Number(payload.sub),
                role: String(payload.role),
            };
        } catch (error) {
            if (
                error instanceof InvalidTokenError &&
                error.message === AUTH_ERRORS.REFRESH_TOKEN_EXPIRED
            )
                return this.decodeExpiredToken(token);
            throw error;
        }
    }

    private decodeExpiredToken(token: string): JwtPayload {
        const decoded = decodeJwtPayload<JwtPayload>(token);

        if (!decoded.sub)
            throw new InvalidTokenError(AUTH_ERRORS.REFRESH_TOKEN_INVALID);

        return {
            sub: Number(decoded.sub),
            role: String(decoded.role),
        };
    }

    private async generateToken(params: TokenGenParams): Promise<string> {
        const payload = params.payload;
        return new SignJWT({ sub: payload.sub.toString(), role: payload.role })
            .setProtectedHeader({ alg: params.algorithm })
            .setAudience(params.audience)
            .setExpirationTime(params.expiresIn)
            .sign(params.secret);
    }

    private extractExpiration(token: string): Date {
        const decoded = decodeJwtPayload<JwtPayloadWithExpiry>(token);
        if (!decoded.exp)
            throw new InvalidTokenError(AUTH_ERRORS.TOKEN_DECODE_FAILED);
        return new Date(decoded.exp * 1000);
    }
}

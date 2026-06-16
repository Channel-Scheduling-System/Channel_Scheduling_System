import bcrypt from 'bcrypt';
import {
    UnauthorizedError,
    DomainError,
} from '../../shared/errors/domain.error.js';
import {
    InvalidCredentialsError,
    ValidationError,
} from '../../shared/errors/validation.error.js';
import { mapToAuthUser } from './auth.mapper.js';
import {
    AuthResult,
    LoginInput,
    LogoutInput,
    RefreshTokenInput,
    RegisterInput,
    VerifyResetCodeInput,
} from './auth.types.js';
import { IUserService } from '../users/user.service.js';
import { IResetCodeService } from '../reset-codes/reset-code.service.js';
import { USER_ERRORS } from '../../shared/constants/messages.js';
import { AuthTokenService, IAuthTokenService } from './auth-token.service.js';
import { AuthDomainService } from './auth-domain.service.js';
import { IAuthRepository } from './auth.repository.js';
import { AUTH_EMAIL_NOT_FOUND_DELAY_MS } from './utils/jwt-config.util.js';
import { hashToken } from './utils/token-hasher.util.js';

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

export class AuthService implements IAuthService {
    private readonly tokenService: IAuthTokenService;
    private readonly domainService: AuthDomainService;

    constructor(
        private readonly authRepo: IAuthRepository,
        private readonly userService: IUserService,
        private readonly resetCodeService: IResetCodeService,
    ) {
        this.tokenService = new AuthTokenService(authRepo);
        this.domainService = new AuthDomainService(authRepo, userService);
    }

    async register(input: RegisterInput): Promise<AuthResult> {
        const user = await this.userService.add({ ...input, role: 'CLIENT' });
        const tokens = await this.tokenService.generateAndStoreTokens(
            user.id,
            user.role,
        );

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
        const tokens = await this.tokenService.generateAndStoreTokens(
            user.id,
            user.role,
        );

        return {
            user: mapToAuthUser(user),
            tokens,
        };
    }

    async refresh(input: RefreshTokenInput): Promise<AuthResult> {
        const token = input.refreshToken;

        const payload = await this.tokenService.verifyRefreshToken(token);
        await this.domainService.validateRefreshTokenReuse(token, payload.sub);
        await this.domainService.validateUserActive(payload);

        await this.authRepo.invalidateRefreshToken(hashToken(token));

        const user = await this.userService.getById(payload.sub);
        if (!user) throw new UnauthorizedError(USER_ERRORS.NOT_FOUND);

        const tokens = await this.tokenService.generateAndStoreTokens(
            user.id,
            user.role,
        );

        return {
            user: mapToAuthUser(user),
            tokens,
        };
    }

    async logout(input: LogoutInput): Promise<void> {
        const token = input.refreshToken;

        const payload = await this.tokenService.verifyRefreshToken(token);
        await this.domainService.validateTokenForLogout(
            token,
            payload,
            input.userId,
        );

        await this.authRepo.invalidateRefreshToken(hashToken(token));
    }

    async requestPasswordReset(email: string): Promise<void> {
        const user = await this.userService.getByEmail(email);
        if (!user?.isActive)
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
        if (!user?.isActive) throw new InvalidCredentialsError();

        try {
            await this.resetCodeService.verifyCode(user.id, input.code);
        } catch (error) {
            if (
                error instanceof DomainError ||
                error instanceof ValidationError
            ) {
                console.error(`Reset code validation failed: ${error.message}`);
                throw new InvalidCredentialsError();
            }
            throw error;
        }

        return await this.tokenService.generateResetToken(user.id);
    }

    async resetPassword(userId: number, newPassword: string): Promise<void> {
        await this.userService.resetPasswordDirect(userId, newPassword);
    }

    async checkAdminExists(): Promise<boolean> {
        const count = await this.userService.countAdmins();
        return count > 0;
    }
}

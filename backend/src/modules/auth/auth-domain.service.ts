import { IUserService } from '../users/user.service.js';
import { IAuthRepository } from './auth.repository.js';
import { JwtPayload } from '../../shared/types/jwt.js';
import {
    UnauthorizedError,
    TokenReuseError,
} from '../../shared/errors/domain.error.js';
import { AUTH_ERRORS, USER_ERRORS } from '../../shared/constants/messages.js';
import { hashToken } from './utils/token-hasher.util.js';

export class AuthDomainService {
    constructor(
        private readonly authRepo: IAuthRepository,
        private readonly userService: IUserService,
    ) {}

    async validateUserActive(payload: JwtPayload): Promise<void> {
        const user = await this.userService.getById(payload.sub);
        if (!user) throw new UnauthorizedError(USER_ERRORS.NOT_FOUND);
        if (!user.isActive)
            throw new UnauthorizedError(USER_ERRORS.USER_DEACTIVATED);
    }

    async validateRefreshTokenReuse(token: string): Promise<void> {
        const tokenHash = hashToken(token);
        const storedToken = await this.authRepo.findRefreshToken(tokenHash);

        if (!storedToken)
            throw new TokenReuseError(AUTH_ERRORS.TOKEN_REUSE_DETECTED);
    }

    async validateTokenForLogout(
        token: string,
        payload: JwtPayload,
        userId: number,
    ): Promise<void> {
        if (userId !== payload.sub)
            throw new UnauthorizedError(AUTH_ERRORS.LOGOUT_UNAUTHORIZED);

        const tokenHash = hashToken(token);
        const storedToken = await this.authRepo.findRefreshToken(tokenHash);

        if (!storedToken)
            throw new UnauthorizedError(AUTH_ERRORS.LOGOUT_INVALID_TOKEN);

        if (storedToken.userId !== payload.sub)
            throw new UnauthorizedError(AUTH_ERRORS.LOGOUT_UNAUTHORIZED);
    }
}

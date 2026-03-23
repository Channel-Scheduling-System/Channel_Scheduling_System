import { AuthResult, AuthUser } from './auth.types.js';
import type { User } from '@prisma/client.js';

/**
 * Maps a user entity to an AuthUser response object
 * @param user - User entity from the database
 * @returns AuthUser object formatted for API responses
 */
export function mapToAuthUser(user: User): AuthUser {
    return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        alias: user.alias,
        role: user.role,
    };
}

/**
 * Maps a AuthResult to an data response object for API responses
 * @param AuthResult - AuthResult object containing user and tokens
 * @returns Object formatted for API responses with user and access token
 */
export function mapToAuthResultResponse(authResult: AuthResult) {
    return {
        user: authResult.user,
        token: authResult.tokens.accessToken,
    };
}

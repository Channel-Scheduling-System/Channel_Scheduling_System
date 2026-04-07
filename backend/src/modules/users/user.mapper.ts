import { User } from '@prisma/client.js';
import { UserResponse } from './user.types.js';

/**
 * Maps a User entity to an UserResponse object
 * @param user - User entity from the database
 * @returns UserResponse object formatted for API responses
 */
export function mapToUserResponse(user: User): UserResponse {
    return {
        id: user.id,
        alias: user.alias,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        role: user.role,
    };
}

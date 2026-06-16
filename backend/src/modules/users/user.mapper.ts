import { User } from '@prisma/client.js';
import { UserFilters, UserResponse } from './user.types.js';
import { userFiltersSchema, userPaginationSchema } from './user.validator.js';
import { Pagination } from '../../shared/types/pagination.types.js';

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
        isActive: user.isActive,
    };
}

/**
 * Maps an array of user entities to an array of UserResponse objects
 * @param users - Array of User entities from the database
 * @returns Array of UserResponse objects formatted for API responses
 */
export function mapToUsersResponse(users: User[]): UserResponse[] {
    return users.map(mapToUserResponse);
}

/**
 * Maps and normalizes query filters for service queries
 * @param filters - Query filters that may contain string values
 * @returns Normalized UserFilters object with correct types
 */
export function mapToUserFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filters: Record<string, any>,
): UserFilters {
    return userFiltersSchema.parse(filters);
}

/**
 * Maps and normalizes pagination query params for user queries
 * @param pagination - Query params that may contain string values
 * @returns Normalized UserPagination object with correct types
 */
export function mapToUserPagination(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pagination: Record<string, any>,
): Pagination {
    return userPaginationSchema.parse(pagination);
}

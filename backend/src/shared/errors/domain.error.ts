/**
 * Base class for business domain errors
 * Represents violations of business rules and constraints
 * NOT for input validation or authentication
 */
export class DomainError extends Error {
    status: number;
    code: string;

    constructor(
        message: string,
        status: number = 400,
        code: string = 'DOMAIN_ERROR',
    ) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.code = code;
    }
}

/**
 * Thrown when an external service fails or is unavailable
 */
export class ServiceError extends DomainError {
    constructor(message: string) {
        super(message, 503, 'SERVICE_ERROR');
    }
}

/**
 * Thrown when requested resource does not exist
 * Status: 404 (Not Found)
 */
export class NotFoundError extends DomainError {
    constructor(message: string) {
        super(message, 404, 'NOT_FOUND_ERROR');
    }
}

/**
 * Thrown when action violates unique constraint or business rule
 * E.g., email already registered, deadline already passed
 * Status: 409 (Conflict)
 */
export class ConflictError extends DomainError {
    constructor(message: string) {
        super(message, 409, 'CONFLICT_ERROR');
    }
}

/**
 * Thrown when entity violates business logic constraints
 * E.g., appointment duration exceeds available slot
 * Status: 422 (Unprocessable Entity)
 */
export class BusinessValidationError extends DomainError {
    constructor(message: string) {
        super(message, 422, 'BUSINESS_VALIDATION_ERROR');
    }
}

/**
 * Thrown when user is not authenticated
 * Different from InvalidCredentialsError (which indicates bad login)
 * Status: 401 (Unauthorized)
 */
export class UnauthorizedError extends DomainError {
    constructor(message: string = 'No autorizado') {
        super(message, 401, 'UNAUTHORIZED_ERROR');
    }
}

/**
 * Thrown when user is authenticated but lacks permission
 * Status: 403 (Forbidden)
 */
export class ForbiddenError extends DomainError {
    constructor(message: string = 'Acceso prohibido') {
        super(message, 403, 'FORBIDDEN_ERROR');
    }
}

/**
 * Thrown when token reuse is detected (security threat)
 * Domain-specific business rule for session security
 * Status: 401 (Unauthorized)
 */
export class TokenReuseError extends DomainError {
    constructor(message: string = 'Reutilización de token detectada') {
        super(message, 401, 'TOKEN_REUSE_ERROR');
    }
}

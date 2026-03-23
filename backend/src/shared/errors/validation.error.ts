/**
 * Base class for validation errors
 * Used for input validation, credentials, and authentication failures
 */
export class ValidationError extends Error {
    status: number;
    code: string;

    constructor(
        message: string,
        status: number = 400,
        code: string = 'VALIDATION_ERROR',
    ) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.code = code;
    }
}

/**
 * Thrown when DTOs/request body validation fails
 * Status: 400 (Bad Request)
 */
export class ValidationDTOError extends ValidationError {
    constructor(public errors: Record<string, unknown>) {
        super('Validación de datos fallida', 400, 'VALIDATION_DTO_ERROR');
    }
}

/**
 * Thrown when credentials (email/username/password) are invalid
 * Status: 401 (Unauthorized)
 */
export class InvalidCredentialsError extends ValidationError {
    constructor(message: string = 'Credenciales inválidas') {
        super(message, 401, 'INVALID_CREDENTIALS_ERROR');
    }
}

/**
 * Thrown when JWT token is invalid or expired
 * Status: 401 (Unauthorized)
 */
export class InvalidTokenError extends ValidationError {
    constructor(message: string = 'Token inválido o expirado') {
        super(message, 401, 'INVALID_TOKEN_ERROR');
    }
}

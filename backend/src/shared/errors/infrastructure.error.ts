export class InfrastructureError extends Error {
    status: number;
    code: string;

    constructor(message: string, status = 500, code = 'INFRASTRUCTURE_ERROR') {
        super(message);
        this.status = status;
        this.code = code;
    }
}

export class DatabaseConnectionError extends InfrastructureError {
    constructor(message = 'Database connection failed') {
        super(message, 503, 'DATABASE_CONNECTION_ERROR');
    }
}

export class CorsError extends InfrastructureError {
    constructor(origin: string) {
        super(`Origin not allowed: ${origin}`, 403, 'CORS_ERROR');
    }
}

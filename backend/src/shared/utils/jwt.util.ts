import { jwtVerify, errors as joseErrors } from 'jose';
import { InvalidTokenError } from '../errors/validation.error.js';

export interface JwtVerifyOptions {
    secret: Uint8Array;
    audience: string;
    errorMessages: {
        expired: string;
        invalid: string;
    };
}

export interface BaseJwtPayload {
    sub: string;
    [key: string]: unknown;
}

export async function verifyJwt<T extends BaseJwtPayload>(
    token: string,
    options: JwtVerifyOptions,
): Promise<T> {
    try {
        const { payload } = await jwtVerify(token, options.secret, {
            audience: options.audience,
        });

        const userId = Number(payload.sub);
        if (!Number.isInteger(userId))
            throw new InvalidTokenError(options.errorMessages.invalid);

        return payload as unknown as T;
    } catch (error) {
        if (error instanceof joseErrors.JWTExpired)
            throw new InvalidTokenError(options.errorMessages.expired);
        if (error instanceof InvalidTokenError) throw error;
        throw new InvalidTokenError(options.errorMessages.invalid);
    }
}

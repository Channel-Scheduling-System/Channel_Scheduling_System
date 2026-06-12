import { InvalidTokenError } from '../../../shared/errors/validation.error.js';
import { AUTH_ERRORS } from '../../../shared/constants/messages.js';

export function base64UrlDecode(str: string): string {
    let s = str.replaceAll(/-/g, '+').replaceAll(/_/g, '/');
    const pad = s.length % 4;
    if (pad === 2) s += '==';
    else if (pad === 3) s += '=';
    else if (pad === 1) s += '===';
    return Buffer.from(s, 'base64').toString('utf-8');
}

export function decodeJwtPayload<T extends object>(token: string): T {
    const parts = token.split('.');
    if (parts.length !== 3)
        throw new InvalidTokenError(AUTH_ERRORS.REFRESH_TOKEN_INVALID);

    try {
        const payloadJson = base64UrlDecode(parts[1]);
        return JSON.parse(payloadJson) as T;
    } catch {
        throw new InvalidTokenError(AUTH_ERRORS.REFRESH_TOKEN_INVALID);
    }
}

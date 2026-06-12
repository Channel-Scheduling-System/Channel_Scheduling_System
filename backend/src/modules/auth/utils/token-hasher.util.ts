import crypto from 'node:crypto';
import { env } from '../../../config/env.js';
import { TOKEN_HASH_ALGORITHM } from './jwt-config.util.js';

export function hashToken(token: string): string {
    return crypto
        .createHmac(TOKEN_HASH_ALGORITHM, env.token.secret)
        .update(token)
        .digest('hex');
}

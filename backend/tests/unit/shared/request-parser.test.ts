/// <reference types="jest" />

import {
    extractAuthContext,
    extractRequestContextWithId,
} from '../../../src/shared/utils/request-parser.util';

describe('request-parser utilities', () => {
    // ── extractAuthContext ────────────────────────────────────────────────
    describe('extractAuthContext', () => {
        it('should extract id and role from req.user', () => {
            const req = {
                user: { sub: 42, role: 'ADMIN' },
            } as any;

            const ctx = extractAuthContext(req);

            expect(ctx.id).toBe(42);
            expect(ctx.role).toBe('ADMIN');
        });

        it('should work with WORKER role', () => {
            const req = { user: { sub: 7, role: 'WORKER' } } as any;
            const ctx = extractAuthContext(req);
            expect(ctx.id).toBe(7);
            expect(ctx.role).toBe('WORKER');
        });
    });

    // ── extractRequestContextWithId ───────────────────────────────────────
    describe('extractRequestContextWithId', () => {
        it('should parse numeric id from params and extract auth context', () => {
            const req = {
                params: { id: '3' },
                user: { sub: 99, role: 'ADMIN' },
            } as any;

            const ctx = extractRequestContextWithId(req);

            expect(ctx.id).toBe(3);
            expect(ctx.auth.id).toBe(99);
            expect(ctx.auth.role).toBe('ADMIN');
        });

        it('should convert string params.id to number', () => {
            const req = {
                params: { id: '100' },
                user: { sub: 1, role: 'CLIENT' },
            } as any;

            const ctx = extractRequestContextWithId(req);

            expect(ctx.id).toBe(100);
            expect(typeof ctx.id).toBe('number');
        });
    });
});

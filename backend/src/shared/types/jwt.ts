export interface JwtPayload {
    readonly sub: number;
    readonly role?: string;
}

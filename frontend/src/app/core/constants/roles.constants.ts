export const ROLES = ['ADMIN', 'WORKER', 'CUSTOMER'] as const;
export type Role = typeof ROLES[number];
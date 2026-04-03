export const ROLES = ['ADMIN', 'WORKER', 'CLIENT'] as const;
export type Role = typeof ROLES[number];
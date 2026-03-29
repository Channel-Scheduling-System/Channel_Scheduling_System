const requiredEnvVars = [
    'NODE_ENV',
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'JWT_SECRET_REFRESH',
    'JWT_EXPIRES_IN_REFRESH',
] as const;

for (const key of requiredEnvVars) {
    if (!process.env[key]) throw new Error(`Missing env variable: ${key}`);
}

export const env = {
    nodeEnv: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    databaseUrl: process.env.DATABASE_URL as string,
    jwt: {
        secret: process.env.JWT_SECRET as string,
        expiresIn: process.env.JWT_EXPIRES_IN as string,
        refresh: process.env.JWT_SECRET_REFRESH as string,
        expiresInRefresh: process.env.JWT_EXPIRES_IN_REFRESH as string,
    },
};

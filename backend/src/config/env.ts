const requiredEnvVars = [
    'DATABASE_HOST',
    'DATABASE_PORT',
    'DATABASE_USER',
    'DATABASE_PASSWORD',
    'DATABASE_NAME',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'JWT_SECRET_REFRESH',
    'JWT_EXPIRES_IN_REFRESH',
] as const;

for (const key of requiredEnvVars) {
    if (!process.env[key]) throw new Error(`Missing env variable: ${key}`);
}

export const env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    database: {
        url: process.env.DATABASE_URL as string || null,
        host: process.env.DATABASE_HOST as string,
        port: process.env.DATABASE_PORT
            ? parseInt(process.env.DATABASE_PORT, 10)
            : 3306,
        user: process.env.DATABASE_USER as string,
        password: process.env.DATABASE_PASSWORD as string,
        name: process.env.DATABASE_NAME as string,
    },
    jwt: {
        secret: process.env.JWT_SECRET as string,
        expiresIn: process.env.JWT_EXPIRES_IN as string,
        refresh: process.env.JWT_SECRET_REFRESH as string,
        expiresInRefresh: process.env.JWT_EXPIRES_IN_REFRESH as string,
    },
};

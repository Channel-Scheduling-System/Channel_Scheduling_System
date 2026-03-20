const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'DATABASE_URL',
    'DATABASE_HOST',
    'DATABASE_USER',
    'DATABASE_PASSWORD',
    'DATABASE_NAME',
] as const;

for (const key of requiredEnvVars) {
    if (!process.env[key]) throw new Error(`Missing env variable: ${key}`);
}

export const env = {
    jwt: {
        secret: process.env.JWT_SECRET as string,
        refresh: process.env.JWT_SECRET_REFRESH as string,
        expiresIn: process.env.JWT_EXPIRES_IN as string,
    },
    database: {
        url: process.env.DATABASE_URL as string,
        host: process.env.DATABASE_HOST as string,
        user: process.env.DATABASE_USER as string,
        password: process.env.DATABASE_PASSWORD as string,
        name: process.env.DATABASE_NAME as string,
    },
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
};

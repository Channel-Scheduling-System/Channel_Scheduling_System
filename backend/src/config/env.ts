const requiredEnvVars = [
    'NODE_ENV',
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'JWT_SECRET_REFRESH',
    'JWT_EXPIRES_IN_REFRESH',
    'JWT_RESETPASS_SECRET',
    'JWT_RESETPASS_EXPIRES_IN',
    'OTP_SECRET',
    'OTP_EXPIRES_IN',
    'TOKEN_SECRET',
    'FIRST_ADMIN_SECRET_CODE',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'EMAIL_FROM',
] as const;

for (const key of requiredEnvVars) {
    if (!process.env[key]) throw new Error(`Missing env variable: ${key}`);
}

export const env = {
    nodeEnv: process.env.NODE_ENV as 'development' | 'production' | 'test',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    databaseUrl: process.env.DATABASE_URL as string,
    jwt: {
        secret: process.env.JWT_SECRET as string,
        expiresIn: process.env.JWT_EXPIRES_IN as string,
        refresh: process.env.JWT_SECRET_REFRESH as string,
        expiresInRefresh: process.env.JWT_EXPIRES_IN_REFRESH as string,
        resetPass: process.env.JWT_RESETPASS_SECRET as string,
        expiresInResetPass: process.env.JWT_RESETPASS_EXPIRES_IN as string,
    },
    otp: {
        secret: process.env.OTP_SECRET as string,
        expiresIn: parseInt(process.env.OTP_EXPIRES_IN as string, 10),
    },
    token: {
        secret: process.env.TOKEN_SECRET as string,
    },
    email: {
        host: process.env.SMTP_HOST as string,
        port: parseInt(process.env.SMTP_PORT as string, 10),
        user: process.env.SMTP_USER as string,
        pass: process.env.SMTP_PASS as string,
        from: process.env.EMAIL_FROM as string,
    },
    firstAdminSecretCode: process.env.FIRST_ADMIN_SECRET_CODE as string,
};

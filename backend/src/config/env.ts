const requiredEnvVars = [
    'NODE_ENV',
    'FRONTEND_URL',
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
    'WHATSAPP_ENABLED',
    'WHATSAPP_PHONE_NUMBER_ID',
    'WHATSAPP_ACCESS_TOKEN',
    'WHATSAPP_BUSINESS_ACCOUNT_ID',
    'WHATSAPP_API_VERSION',
] as const;

for (const key of requiredEnvVars) {
    if (!process.env[key]) throw new Error(`Missing env variable: ${key}`);
}

export const env = {
    nodeEnv: process.env.NODE_ENV as 'development' | 'production' | 'test',
    frontendUrl: process.env.FRONTEND_URL as string,
    port: process.env.PORT ? getEnvNumber('PORT') : 3000,
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
        expiresIn: getEnvNumber('OTP_EXPIRES_IN'),
    },
    token: {
        secret: process.env.TOKEN_SECRET as string,
    },
    email: {
        host: process.env.SMTP_HOST as string,
        port: getEnvNumber('SMTP_PORT'),
        user: process.env.SMTP_USER as string,
        pass: process.env.SMTP_PASS as string,
        from: process.env.EMAIL_FROM as string,
    },
    whatsapp: {
        enabled: process.env.WHATSAPP_ENABLED === 'true',
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
        businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
        apiVersion: process.env.WHATSAPP_API_VERSION ?? 'v19.0',
    },
    firstAdminSecretCode: process.env.FIRST_ADMIN_SECRET_CODE as string,
};

function getEnvNumber(key: string): number {
    const value = process.env[key];
    const parsed = Number(value);
    if (Number.isNaN(parsed))
        throw new Error(`Env variable ${key} must be a number`);
    return parsed;
}

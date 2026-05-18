import crypto from 'crypto';

// Set minimal env vars before importing app modules (env.ts validates presence)
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:memorydb?mode=memory&cache=shared';
process.env.JWT_SECRET = 'jwt';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_SECRET_REFRESH = 'jwt_refresh';
process.env.JWT_EXPIRES_IN_REFRESH = '7d';
process.env.JWT_RESETPASS_SECRET = 'reset_secret';
process.env.JWT_RESETPASS_EXPIRES_IN = '1h';
process.env.OTP_SECRET = 'otp_secret_test';
process.env.OTP_EXPIRES_IN = String(10 * 60 * 1000); // 10 minutes
process.env.TOKEN_SECRET = 'token_secret';
process.env.FIRST_ADMIN_SECRET_CODE = 'first_admin';
process.env.SMTP_HOST = 'localhost';
process.env.SMTP_PORT = '1025';
process.env.SMTP_USER = 'user';
process.env.SMTP_PASS = 'pass';
process.env.EMAIL_FROM = 'no-reply@example.com';

import { ResetCodeService } from '../../src/modules/reset-codes/reset-code.service';
import { emailService } from '../../src/shared/services/email/index';
import { InvalidCredentialsError } from '../../src/shared/errors/validation.error';
import { NotFoundError, BusinessValidationError } from '../../src/shared/errors/domain.error';

describe('ResetCodeService', () => {
    let repoMock: any;
    let service: ResetCodeService;

    beforeEach(() => {
        repoMock = {
            invalidatePreviousCodes: jest.fn().mockResolvedValue(undefined),
            create: jest.fn().mockResolvedValue({}),
            findByUserId: jest.fn(),
            incrementAttempts: jest.fn().mockResolvedValue(undefined),
            markAsUsed: jest.fn().mockResolvedValue(undefined),
        };

        jest.spyOn(emailService, 'send').mockResolvedValue(undefined as any);

        service = new ResetCodeService(repoMock);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('generateAndSend sends email and stores reset code', async () => {
        await service.generateAndSend({ userId: 1, email: 'test@example.com' });

        expect(emailService.send).toHaveBeenCalled();
        expect(repoMock.invalidatePreviousCodes).toHaveBeenCalledWith(1);
        expect(repoMock.create).toHaveBeenCalledTimes(1);

        const arg = repoMock.create.mock.calls[0][0];
        expect(arg.userId).toBe(1);
        expect(typeof arg.codeHash).toBe('string');
        expect(arg.expireAt).toBeInstanceOf(Date);
    });

    it('verifyCode throws NotFoundError when no code exists', async () => {
        repoMock.findByUserId.mockResolvedValue(null);

        await expect(service.verifyCode(1, '000000')).rejects.toThrow(NotFoundError);
    });

    it('verifyCode throws BusinessValidationError when code is used', async () => {
        const resetCode = {
            id: 1,
            codeHash: 'x',
            used: true,
            attempts: 0,
            expireAt: new Date(Date.now() + 10000),
            createdAt: new Date(),
        };
        repoMock.findByUserId.mockResolvedValue(resetCode);

        await expect(service.verifyCode(1, '000000')).rejects.toThrow(BusinessValidationError);
    });

    it('verifyCode throws BusinessValidationError when code is expired', async () => {
        const resetCode = {
            id: 2,
            codeHash: 'x',
            used: false,
            attempts: 0,
            expireAt: new Date(Date.now() - 10000),
            createdAt: new Date(),
        };
        repoMock.findByUserId.mockResolvedValue(resetCode);

        await expect(service.verifyCode(2, '000000')).rejects.toThrow(BusinessValidationError);
    });

    it('verifyCode throws BusinessValidationError when max attempts reached', async () => {
        const resetCode = {
            id: 3,
            codeHash: 'x',
            used: false,
            attempts: 3,
            expireAt: new Date(Date.now() + 10000),
            createdAt: new Date(),
        };
        repoMock.findByUserId.mockResolvedValue(resetCode);

        await expect(service.verifyCode(3, '000000')).rejects.toThrow(BusinessValidationError);
    });

    it('verifyCode increments attempts and throws InvalidCredentialsError on bad code', async () => {
        const resetCode = {
            id: 4,
            codeHash: 'wronghash',
            used: false,
            attempts: 0,
            expireAt: new Date(Date.now() + 10000),
            createdAt: new Date(),
        };
        repoMock.findByUserId.mockResolvedValue(resetCode);

        await expect(service.verifyCode(4, '123456')).rejects.toThrow(InvalidCredentialsError);
        expect(repoMock.incrementAttempts).toHaveBeenCalledWith(4);
    });

    it('verifyCode marks code as used when code is valid', async () => {
        const userId = 5;
        const otp = '123456';
        const codeHash = crypto
            .createHmac('sha256', process.env.OTP_SECRET as string)
            .update(`${otp}.${userId}`)
            .digest('hex');

        const resetCode = {
            id: 5,
            codeHash,
            used: false,
            attempts: 0,
            expireAt: new Date(Date.now() + 10000),
            createdAt: new Date(),
        };
        repoMock.findByUserId.mockResolvedValue(resetCode);

        await expect(service.verifyCode(userId, otp)).resolves.toBeUndefined();
        expect(repoMock.markAsUsed).toHaveBeenCalledWith(5);
    });
});

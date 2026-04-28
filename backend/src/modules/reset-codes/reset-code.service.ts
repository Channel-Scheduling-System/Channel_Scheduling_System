import crypto from 'crypto';
import { env } from '../../config/env.js';
import { emailService } from '../../shared/services/email/index.js';
import { generatePasswordResetEmailHTML } from '../../shared/services/email/templates/password-reset.template.js';
import { IResetCodeRepository } from './reset-code.repository.js';
import { ResetCode, ResetCodeRequestInput } from './reset-code.types.js';
import {
    BusinessValidationError,
    NotFoundError,
} from '../../shared/errors/domain.error.js';
import { InvalidCredentialsError } from '../../shared/errors/validation.error.js';
import { RESET_CODE_ERRORS } from '../../shared/constants/messages.js';

export interface IResetCodeService {
    generateAndSend(input: ResetCodeRequestInput): Promise<void>;
    verifyCode(userId: number, code: string): Promise<void>;
}

const CODE_HASH_ALGORITHM = 'sha256';
const OTP_LENGTH = 6;
const SUBJECT = 'Restablece tu contraseña - Channel Scheduling System';
const MAX_ATTEMPTS = 5;

export class ResetCodeService implements IResetCodeService {
    constructor(private resetCodeRepo: IResetCodeRepository) {}

    async generateAndSend(input: ResetCodeRequestInput): Promise<void> {
        const otp = this.generateOTP();
        const codeHash = this.hashOTP(otp, input.userId);
        const expiresInMinutes = Math.round(env.otp.expiresIn / 60000);
        await this.sendEmail(input.email, otp, expiresInMinutes);
        await this.storeResetCode(input.userId, codeHash);
    }

    private async sendEmail(to: string, otp: string, expiresInMinutes: number) {
        const html = generatePasswordResetEmailHTML({ otp, expiresInMinutes });
        await emailService.send({ to, subject: SUBJECT, html });
    }

    private async storeResetCode(userId: number, codeHash: string) {
        await this.resetCodeRepo.invalidatePreviousCodes(userId);
        await this.resetCodeRepo.create({
            userId: userId,
            codeHash,
            expireAt: new Date(Date.now() + env.otp.expiresIn),
        });
    }

    private generateOTP() {
        const buffer = crypto.randomBytes(4);
        const MAX_OTP = Math.pow(10, OTP_LENGTH);
        const randomNum = buffer.readUInt32BE(0) % MAX_OTP;
        return randomNum.toString().padStart(OTP_LENGTH, '0');
    }

    private hashOTP(otp: string, userId: number): string {
        return crypto
            .createHmac(CODE_HASH_ALGORITHM, env.otp.secret)
            .update(`${otp}.${userId}`)
            .digest('hex');
    }

    async verifyCode(userId: number, code: string): Promise<void> {
        const resetCode = await this.resetCodeRepo.findByUserId(userId);
        if (!resetCode) throw new NotFoundError(RESET_CODE_ERRORS.NOT_FOUND);

        this.ensureCodeIsValid(resetCode);

        const codeHash = this.hashOTP(code, userId);
        const isValid = resetCode.codeHash === codeHash;

        if (!isValid) {
            await this.resetCodeRepo.incrementAttempts(resetCode.id);
            throw new InvalidCredentialsError(RESET_CODE_ERRORS.INVALID_CODE);
        }
        await this.resetCodeRepo.markAsUsed(resetCode.id);
    }

    private ensureCodeIsValid(resetCode: ResetCode): void {
        if (resetCode.used)
            throw new BusinessValidationError(RESET_CODE_ERRORS.INVALID_CODE);

        if (resetCode.expireAt < new Date())
            throw new BusinessValidationError(RESET_CODE_ERRORS.EXPIRED);

        if (resetCode.attempts >= MAX_ATTEMPTS)
            throw new BusinessValidationError(RESET_CODE_ERRORS.MAX_ATTEMPTS);
    }
}

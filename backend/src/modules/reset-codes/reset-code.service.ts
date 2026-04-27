import crypto from 'crypto';
import { env } from '../../config/env.js';
import { emailService } from '../../shared/services/email/index.js';
import { generatePasswordResetEmailHTML } from '../../shared/services/email/templates/password-reset.template.js';
import { IResetCodeRepository } from './reset-code.repository.js';
import { ResetCodeRequestInput } from './reset-code.types.js';

export interface IResetCodeService {
    generateAndSend(input: ResetCodeRequestInput): Promise<void>;
}

const CODE_HASH_ALGORITHM = 'sha256';
const OTP_LENGTH = 6;
const SUBJECT = 'Restablece tu contraseña - Channel Scheduling System';

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
        await this.resetCodeRepo.invalidate(userId);
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
}

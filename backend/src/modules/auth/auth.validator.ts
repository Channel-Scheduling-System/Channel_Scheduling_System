import { z } from 'zod';
import {
    validateBodyDTO,
    validateCookieDTO,
} from '../../shared/middlewares/validateDTO.middleware.js';
import {
    userPassword,
    userAlias,
    userEmail,
    userPhone,
    createUserInput,
} from '../users/user.validator.js';
import { resetCodeRequestInput } from '../reset-codes/reset-code.validator.js';

// ============================================================
// * INPUT DTOs
// ============================================================
const registerInput = createUserInput.omit({ role: true }).strict();

const loginInput = z
    .object({
        identifier: z.union([userAlias, userEmail, userPhone]),
        password: userPassword,
    })
    .strict();

const refreshTokenInput = z.jwt({ alg: 'HS256' });

const verifyResetCodeInput = z
    .object({
        email: userEmail,
        code: z.string().length(6, 'El código debe tener 6 dígitos'),
    })
    .strict();

const resetPasswordInput = z.object({ newPassword: userPassword }).strict();

// Export centralizado
//* -----------------------------
export const authValidator = {
    register: validateBodyDTO(registerInput),
    login: validateBodyDTO(loginInput),
    refreshToken: validateCookieDTO('refreshToken', refreshTokenInput),
    requestPasswordReset: validateBodyDTO(resetCodeRequestInput),
    verifyResetCode: validateBodyDTO(verifyResetCodeInput),
    resetPassword: validateBodyDTO(resetPasswordInput),
};

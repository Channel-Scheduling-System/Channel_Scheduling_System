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
import { resetCodeRequestDTO } from '../reset-codes/reset-code.validator.js';

// REGISTER
//* -----------------------------
const registerDTO = createUserInput.omit({ role: true }).strict();

// LOGIN
//* -----------------------------
const loginDTO = z
    .object({
        identifier: z.union([userAlias, userEmail, userPhone]),
        password: userPassword,
    })
    .strict();

// REFRESH TOKEN
//* -----------------------------
const refreshTokenDTO = z
    .string()
    .min(1, 'El token es requerido')
    .regex(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
        'Token JWT inválido',
    );

// VERIFY RESET CODE
//* -----------------------------
const verifyResetCodeDTO = z
    .object({
        email: userEmail,
        code: z.string().length(6, 'El código debe tener 6 dígitos'),
    })
    .strict();

// RESET PASSWORD
//* -----------------------------
const resetPasswordDTO = z.object({ newPassword: userPassword }).strict();

// Export centralizado
//* -----------------------------
export const authValidator = {
    register: validateBodyDTO(registerDTO),
    login: validateBodyDTO(loginDTO),
    refreshToken: validateCookieDTO('refreshToken', refreshTokenDTO),
    requestPasswordReset: validateBodyDTO(resetCodeRequestDTO),
    verifyResetCode: validateBodyDTO(verifyResetCodeDTO),
    resetPassword: validateBodyDTO(resetPasswordDTO),
};

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { createFieldValidator } from '../../../core/validators/field.validators';
import { SendRecoveryCodeRequestSchema } from '../models/requests/send-code-requests.model';
import { PasswordRecoveryRequestSchema } from '../models/requests/recovery-password-request.model';

export type Phase1FieldName = 'email';
export type Phase3FieldName = 'newPassword';

export const phase1FieldValidator = (fieldName: Phase1FieldName) =>
  createFieldValidator(SendRecoveryCodeRequestSchema, fieldName);

export const phase3FieldValidator = (fieldName: Phase3FieldName) =>
  createFieldValidator(PasswordRecoveryRequestSchema, fieldName);

// Phase 2: el código se ingresa como texto pero se envía como número,
// por eso no puede usar createFieldValidator (Zod esperaría number, no string)
export const codeValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    if (!value) return null;
    if (!/^\d+$/.test(value)) return { code: 'El código solo debe contener números' };
    if (value.length < 6)     return { code: 'El código es demasiado corto' };
    if (value.length > 8)     return { code: 'El código no puede exceder 8 dígitos' };
    return null;
  };
};
import { ValidatorFn } from '@angular/forms';
import { ResetUserPasswordRequestSchema } from '../models/requests/reset-password-request.model';
import { createFieldValidator } from '../../../core/validators/field.validators';

export type ResetPasswordFieldName = 'password' | 'newPassword';

export const resetPasswordFieldValidator = (fieldName: ResetPasswordFieldName): ValidatorFn =>
  createFieldValidator(ResetUserPasswordRequestSchema, fieldName);
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { RegisterUserRequestBaseSchema } from '../models/requests/register/register-request.model';
import { createFieldValidator } from '../../../core/validators/field.validators';

export type RegisterUserFieldName =
  | 'alias'
  | 'firstName'
  | 'lastName'
  | 'phone'
  | 'email'
  | 'password';

export const registerUserFieldValidator = (fieldName: RegisterUserFieldName) =>
  createFieldValidator(RegisterUserRequestBaseSchema, fieldName);

export function passwordMatchValidator(
  passwordField: string,
  confirmField: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordField)?.value;
    const confirm  = control.get(confirmField)?.value;
    if (password && confirm && password !== confirm) {
      return { passwordsMismatch: 'Las contraseñas no coinciden' };
    }
    return null;
  };
}
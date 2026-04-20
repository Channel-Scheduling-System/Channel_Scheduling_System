import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { RegisterFirstAdminRequestSchema } from '../models/requests/register-first-admin-request.model';
import { createFieldValidator } from '../../../core/validators/field.validators';

export type FirstAdminFieldName = 'firstName' | 'lastName' | 'alias' | 'email' | 'phone' | 'password' | 'secretCode';

export const registerFirstAdminFieldValidator = (fieldName: FirstAdminFieldName) =>
  createFieldValidator(RegisterFirstAdminRequestSchema, fieldName);

export function passwordMatchValidator(passwordField: string, confirmField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordField)?.value;
    const confirm  = control.get(confirmField)?.value;
    if (password !== confirm) {
      return { passwordsMismatch: 'Las contraseñas no coinciden' };
    }
    return null;
  };
}
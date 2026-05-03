import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { createFieldValidator } from '../../../core/validators/field.validators';
import { RegisterClientRequestSchema } from '../models/requests/register-client-request.model';

export type RegisterFieldName = 'firstName' | 'lastName' | 'alias' | 'email' | 'phone' | 'password';

export const registerFieldValidator = (fieldName: 'firstName' | 'lastName' | 'alias' | 'email' | 'phone' | 'password') => 
  createFieldValidator(RegisterClientRequestSchema, fieldName);

export function passwordMatchValidator(passwordField: string, confirmField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordField)?.value;
    const confirm = control.get(confirmField)?.value;
    
    if (password !== confirm) {
      return { passwordsMismatch: 'Las contraseñas no coinciden' };
    }
    return null;
  };
}
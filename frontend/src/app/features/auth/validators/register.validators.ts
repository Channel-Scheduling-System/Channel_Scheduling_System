import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { RegisterRequestBaseSchema } from '../../users/models/requests/register-request.model';
import { createFieldValidator } from '../../../core/validators/field.validators';

export type RegisterFieldName = 'firstName' | 'lastName' | 'alias' | 'email' | 'phone' | 'password';

export const registerFieldValidator = (fieldName: 'firstName' | 'lastName' | 'alias' | 'email' | 'phone' | 'password') => 
  createFieldValidator(RegisterRequestBaseSchema, fieldName);

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
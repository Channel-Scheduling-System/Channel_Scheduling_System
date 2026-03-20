import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { LoginRequestSchema } from '../models/requests/login/login-request.model';

export function fieldValidator(fieldName: 'identifier' | 'password'): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const fieldSchema = LoginRequestSchema.shape[fieldName];
    const result = fieldSchema.safeParse(control.value);
    
    if (result.success) {
      return null;
    }

    return {
      [fieldName]: result.error.issues[0]?.message || 'Campo inválido'
    };
  };
}
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { z } from 'zod';

export function createZodValidator<T extends z.ZodTypeAny>(
  schema: T,
  fieldName?: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const result = schema.safeParse(control.value);
    
    if (result.success) {
      return null;
    }

    const errorMessage = result.error.issues[0]?.message || 'Campo inválido';
    
    if (fieldName) {
      return { [fieldName]: errorMessage };
    }
    
    return { zodError: errorMessage };
  };
}
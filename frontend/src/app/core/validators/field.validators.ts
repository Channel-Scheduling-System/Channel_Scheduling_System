import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { z } from 'zod';

export function createFieldValidator<T extends z.ZodTypeAny>(
  baseSchema: T,
  fieldName: keyof z.infer<T>
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const fieldSchema = (baseSchema as any).shape[fieldName];
    if (!fieldSchema) {
      return null;
    }
    
    const result = fieldSchema.safeParse(control.value);
    
    if (result.success) {
      return null;
    }

    return {
      [fieldName]: result.error.issues[0]?.message || 'Campo inválido'
    };
  };
}
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function cancelReasonValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }

    if (control.value.length > 300) {
      return {
        cancelReason: 'El motivo no puede exceder 300 caracteres',
      };
    }

    return null;
  };
}
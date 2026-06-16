import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { serviceDuration } from '../../../shared/models/entities/service.schema';

export function appointmentDurationValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined) {
      return { duration: 'La duración es obligatoria' };
    }

    const result = serviceDuration.safeParse(control.value);

    if (result.success) return null;

    return {
      duration: result.error.issues[0]?.message ?? 'Duración inválida',
    };
  };
}
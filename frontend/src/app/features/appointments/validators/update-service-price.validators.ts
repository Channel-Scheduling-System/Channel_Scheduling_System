import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { servicePrice } from '../../../shared/models/entities/service.schema';

export function appointmentPriceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined) {
      return { price: 'El precio es obligatorio' };
    }

    const result = servicePrice.safeParse(control.value);

    if (result.success) return null;

    return {
      price: result.error.issues[0]?.message ?? 'Precio inválido',
    };
  };
}
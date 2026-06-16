import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AppointmentNotes } from '../../../shared/models/entities/appointment.schema';

export function appointmentNotesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }

    const result = AppointmentNotes.safeParse(control.value);

    if (result.success) return null;

    return {
      notes: result.error.issues[0]?.message ?? 'Notas inválidas',
    };
  };
}
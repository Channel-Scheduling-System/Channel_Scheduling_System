import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const toMinutes = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export function timeFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString().trim();
    if (!value) return null;
    return TIME_REGEX.test(value)
      ? null
      : { timeFormat: 'Formato inválido — use HH:mm' };
  };
}

export function endAfterStartGroupValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = (group.get('startTime')?.value ?? '').toString().trim();
    const end   = (group.get('endTime')?.value   ?? '').toString().trim();
    if (!TIME_REGEX.test(start) || !TIME_REGEX.test(end)) return null;
    return toMinutes(start) < toMinutes(end)
      ? null
      : { endAfterStart: 'La hora de fin debe ser mayor a la de inicio' };
  };
}
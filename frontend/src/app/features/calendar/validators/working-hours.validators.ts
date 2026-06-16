import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { workingHourSchema } from '../models/requests/update-working-hours-request.model';
const DUMMY_DAY = 'MONDAY' as const;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
export function timeFormatValidator(field: 'startTime' | 'endTime' = 'startTime'): ValidatorFn {
  return (ctrl: AbstractControl): ValidationErrors | null => {
    const v = (ctrl.value ?? '').toString().trim();
    if (!v) return null;
    const obj = field === 'startTime'
      ? { dayOfWeek: DUMMY_DAY, startTime: v, endTime: '23:30' }
      : { dayOfWeek: DUMMY_DAY, startTime: '00:30', endTime: v };
    const result = workingHourSchema.safeParse(obj);
    if (result.success) return null;
    const issue = result.error.issues.find(i =>
      Array.isArray(i.path) && i.path.includes(field),
    );
    return issue ? { timeFormat: issue.message } : null;
  };
}
export function endAfterStartGroupValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = (group.get('startTime')?.value ?? '').toString().trim();
    const end = (group.get('endTime')?.value ?? '').toString().trim();
    if (!TIME_REGEX.test(start) || !TIME_REGEX.test(end)) return null;
    const result = workingHourSchema.safeParse({
      dayOfWeek: DUMMY_DAY,
      startTime: start,
      endTime: end,
    });
    if (result.success) return null;
    const issue = result.error.issues.find(i =>
      Array.isArray(i.path) && i.path.includes('endTime'),
    );
    return issue ? { endAfterStart: issue.message } : null;
  };
}
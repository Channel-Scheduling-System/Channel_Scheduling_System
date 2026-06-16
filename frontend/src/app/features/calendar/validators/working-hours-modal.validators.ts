import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { createFieldValidator } from '../../../core/validators/field.validators';
import { workingHourSchema } from '../models/requests/update-working-hours-request.model';
export type WorkingHoursFieldName = 'startTime' | 'endTime';
export const workingHoursFieldValidator = (fieldName: WorkingHoursFieldName) =>
  createFieldValidator(workingHourSchema, fieldName);
export function workingHoursGroupValidator(dayOfWeek: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const startTime = (group.get('startTime')?.value ?? '').toString().trim();
    const endTime = (group.get('endTime')?.value ?? '').toString().trim();
    const result = workingHourSchema.safeParse({
      dayOfWeek,
      startTime,
      endTime,
    });
    if (result.success) return null;
    const issue = result.error.issues.find((item) =>
      item.code === 'custom' && Array.isArray(item.path)
      && (item.path[0] === 'startTime' || item.path[0] === 'endTime'),
    );
    return issue ? { [issue.path[0] as string]: issue.message } : null;
  };
}

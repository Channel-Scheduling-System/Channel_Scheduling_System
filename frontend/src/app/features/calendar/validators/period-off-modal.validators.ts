import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { createFieldValidator } from '../../../core/validators/field.validators';
import { SetPeriodOffSchema } from '../models/requests/set-period-off-request.model';
export type PeriodOffFieldName = 'startDate' | 'endDate' | 'reason';
export const periodOffFieldValidator = (fieldName: PeriodOffFieldName) =>
  createFieldValidator(SetPeriodOffSchema, fieldName);
export const periodOffGroupValidator = (): ValidatorFn => {
  return (group: AbstractControl): ValidationErrors | null => {
    const result = SetPeriodOffSchema.safeParse({
      startDate: (group.get('startDate')?.value ?? '').toString().trim(),
      endDate: (group.get('endDate')?.value ?? '').toString().trim(),
      reason: (group.get('reason')?.value ?? '').toString(),
    });
    if (result.success) return null;
    const issue = result.error.issues.find((item) =>
      item.code === 'custom' && Array.isArray(item.path) && item.path[0] === 'endDate',
    );
    return issue ? { endDate: issue.message } : null;
  };
};

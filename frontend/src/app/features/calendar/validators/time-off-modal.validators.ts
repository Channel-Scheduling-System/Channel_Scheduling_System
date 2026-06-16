import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { createFieldValidator } from '../../../core/validators/field.validators';
import { SetTimeOffSchema } from '../models/requests/set-time-off-request.model';
import type { TimeOffBlockType } from '../types/time-off.types';
export type TimeOffFieldName =
  | 'type'
  | 'date'
  | 'dayOfWeek'
  | 'startTime'
  | 'endTime'
  | 'reason';
const getSchemaForType = (type: TimeOffBlockType) => {
  const map = (SetTimeOffSchema as any).optionsMap;
  if (map?.get) {
    return map.get(type);
  }
  const options = (SetTimeOffSchema as any).options ?? [];
  return options.find((opt: any) => opt.shape?.type?._def?.value === type) ?? options[0];
};
export const timeOffFieldValidator = (
  fieldName: TimeOffFieldName,
  getType: () => TimeOffBlockType,
): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const schema = getSchemaForType(getType());
    if (!schema) return null;
    return createFieldValidator(schema, fieldName)(control);
  };
};
export const timeOffGroupValidator = (getType: () => TimeOffBlockType): ValidatorFn => {
  return (group: AbstractControl): ValidationErrors | null => {
    const type = getType();
    const result = SetTimeOffSchema.safeParse({
      type,
      date: (group.get('date')?.value ?? '').toString().trim(),
      dayOfWeek: (group.get('dayOfWeek')?.value ?? '').toString().trim(),
      startTime: (group.get('startTime')?.value ?? '').toString().trim(),
      endTime: (group.get('endTime')?.value ?? '').toString().trim(),
      reason: (group.get('reason')?.value ?? '').toString(),
    });
    if (result.success) return null;
    const issue = result.error.issues.find((item) =>
      item.code === 'custom' && Array.isArray(item.path) && item.path[0] === 'endTime',
    );
    return issue ? { endTime: issue.message } : null;
  };
};

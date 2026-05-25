import { createFieldValidator } from '../../../core/validators/field.validators';
import { SetDayOffSchema } from '../models/requests/set-day-off-request.model';
export type DayOffFieldName = 'date' | 'reason';
export const dayOffFieldValidator = (fieldName: DayOffFieldName) =>
  createFieldValidator(SetDayOffSchema, fieldName);

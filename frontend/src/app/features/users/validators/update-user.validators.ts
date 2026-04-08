import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { UpdateUserRequestSchema } from '../models/requests/update/update-request.model';
import { createFieldValidator } from '../../../core/validators/field.validators';

export type UpdateUserFieldName =
  | 'alias'
  | 'firstName'
  | 'lastName'
  | 'phone'
  | 'email';

export const updateUserFieldValidator = (fieldName: UpdateUserFieldName): ValidatorFn =>
  createFieldValidator(UpdateUserRequestSchema, fieldName);
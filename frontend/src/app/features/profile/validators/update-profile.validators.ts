import { ValidatorFn } from '@angular/forms';
import { UpdateProfileRequestSchema } from '../models/requests/update-profile/update-profile-request.model';
import { createFieldValidator } from '../../../core/validators/field.validators';

export type UpdateProfileFieldName =
  | 'alias'
  | 'firstName'
  | 'lastName'
  | 'phone'
  | 'email';

export const updateProfileFieldValidator = (fieldName: UpdateProfileFieldName): ValidatorFn =>
  createFieldValidator(UpdateProfileRequestSchema, fieldName);
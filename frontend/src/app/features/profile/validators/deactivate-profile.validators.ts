import { ValidatorFn } from '@angular/forms';
import { DeactivateProfileRequestSchema } from '../models/requests/deactivate-profile-request.model';
import { createFieldValidator } from '../../../core/validators/field.validators';

export const deactivatePasswordValidator = (): ValidatorFn =>
  createFieldValidator(DeactivateProfileRequestSchema, 'password');
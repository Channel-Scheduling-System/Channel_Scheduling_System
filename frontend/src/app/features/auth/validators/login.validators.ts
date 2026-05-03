import { LoginRequestSchema } from '../models/requests/login-request.model';
import { createFieldValidator } from '../../../core/validators/field.validators';

export type LoginFieldName = 'identifier' | 'password';

export const loginFieldValidator = (fieldName: LoginFieldName) => 
  createFieldValidator(LoginRequestSchema, fieldName);
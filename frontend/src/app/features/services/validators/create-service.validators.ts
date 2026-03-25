import { createFieldValidator } from '../../../core/validators/field.validators';
import { CreateServiceRequestSchema } from '../models/requests/create-service-request';

export type CreateServiceFieldName = 'name' | 'description' | 'price' | 'duration';

export const createServiceFieldValidator = (fieldName: CreateServiceFieldName) =>
  createFieldValidator(CreateServiceRequestSchema, fieldName);
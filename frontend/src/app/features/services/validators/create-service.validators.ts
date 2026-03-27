import { createFieldValidator } from '../../../core/validators/field.validators';
import { CreateServiceRequestSchema } from '../models/requests/create-service-request.model';

export type ServiceFieldName = 'name' | 'description' | 'price' | 'duration';

export const serviceFieldValidator = (fieldName: ServiceFieldName) =>
  createFieldValidator(CreateServiceRequestSchema, fieldName);
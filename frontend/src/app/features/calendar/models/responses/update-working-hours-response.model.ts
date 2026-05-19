import { z } from 'zod';
import { BaseSuccessResponseSchema} from '../../../../shared/models/api/success-response.schema';

export const UpdateWorkingHoursResponseSchema = BaseSuccessResponseSchema;

export type UpdateWorkingHoursResponse = z.infer<typeof UpdateWorkingHoursResponseSchema>;
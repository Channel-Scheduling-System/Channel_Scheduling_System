import { z } from 'zod';
import { UserSchema } from '../../../../shared/models/entities/user.schema';
import { SuccessResponseWithDataSchema } from '../../../../shared/models/api/success-response.schema';

const GetProfileUserSchema = UserSchema.omit({ id: true, role: true });

export const GetProfileResponseSchema = SuccessResponseWithDataSchema(GetProfileUserSchema);

export type GetProfileResponse = z.infer<typeof GetProfileResponseSchema>;
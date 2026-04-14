import { z } from 'zod';
import { UserSchema } from '../../../../shared/models/entities/user.schema';
import { SuccessResponseWithDataSchema } from '../../../../shared/models/api/success-response.schema';

const GetUserSchema = UserSchema.omit({ id: true, role: true });

export const GetUserResponseSchema = SuccessResponseWithDataSchema(GetUserSchema);

export type GetUserResponse = z.infer<typeof GetUserResponseSchema>;
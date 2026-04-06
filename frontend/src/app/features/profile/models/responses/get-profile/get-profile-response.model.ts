import { z } from 'zod';
import { UserSchema } from '../../../../../shared/models/entities/user.schema';
import { SuccessResponseWithDataSchema } from '../../../../../shared/models/api/success-response.schema';

const ProfileUserSchema = UserSchema.omit({ id: true, role: true });

const GetProfileDataSchema = z.object({
  user: ProfileUserSchema
});

export const GetProfileResponseSchema = SuccessResponseWithDataSchema(GetProfileDataSchema);

export type GetProfileResponse = z.infer<typeof GetProfileResponseSchema>;
export type ProfileUser = z.infer<typeof ProfileUserSchema>;
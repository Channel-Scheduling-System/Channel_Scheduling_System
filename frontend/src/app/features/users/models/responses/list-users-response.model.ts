import { z } from 'zod';
import { UserSchema } from '../../../../shared/models/entities/user.schema';
import { BaseSuccessResponseSchema } from '../../../../shared/models/api/success-response.schema';

const ListUserItemSchema = UserSchema;

const MetaSchema = z.object({
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  page: z.number().int().positive(),
  totalPages: z.number().int().nonnegative()
});

const ListUsersDataSchema = z.array(ListUserItemSchema);

export const ListUsersResponseSchema = BaseSuccessResponseSchema.extend({
  data: ListUsersDataSchema,
  meta: MetaSchema
});

export type ListUsersResponse = z.infer<typeof ListUsersResponseSchema>;
export type ListUserItem = z.infer<typeof ListUserItemSchema>;
export type Meta = z.infer<typeof MetaSchema>;
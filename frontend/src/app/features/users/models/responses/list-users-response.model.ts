import { z } from 'zod';
import { UserSchema } from '../../../../shared/models/entities/user.schema';
import { BaseSuccessResponseSchema } from '../../../../shared/models/api/success-response.schema';
import { MetaSchema } from '../../../../shared/models/entities/entity-base.schema';

const ListUserItemSchema = UserSchema;



const ListUsersDataSchema = z.array(ListUserItemSchema);

export const ListUsersResponseSchema = BaseSuccessResponseSchema.extend({
  data: ListUsersDataSchema,
  meta: MetaSchema
});

export type ListUsersResponse = z.infer<typeof ListUsersResponseSchema>;
export type ListUserItem = z.infer<typeof ListUserItemSchema>;
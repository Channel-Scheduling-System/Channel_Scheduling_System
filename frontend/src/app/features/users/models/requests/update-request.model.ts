import z from "zod";
import { UserSchema } from "../../../../shared/models/entities/user.schema";

export const UpdateUserRequestSchema = UserSchema.omit({ id: true, role: true });


export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
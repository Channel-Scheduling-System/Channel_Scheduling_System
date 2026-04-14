import z from "zod";
import { UserSchema } from "../../../../shared/models/entities/user.schema";

export const UpdateProfileRequestSchema = UserSchema.omit({ id: true, role: true, isActive: true });

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;
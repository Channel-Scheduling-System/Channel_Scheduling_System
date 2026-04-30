import z from "zod";
import { password, UserSchema } from "../../../../shared/models/entities/user.schema";

const ClientRegistrationFields = UserSchema.omit({ id: true, role: true, isActive: true });
export const RegisterClientRequestSchema = ClientRegistrationFields.extend({
    password: password
});

export type RegisterClientRequest = z.infer<typeof RegisterClientRequestSchema>;
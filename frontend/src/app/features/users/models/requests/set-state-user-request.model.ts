import z from "zod";

export const SetStateUserRequestSchema = z.object({
  isActive: z.boolean()
});

export type SetStateUserRequest = z.infer<typeof SetStateUserRequestSchema>;
import z from "zod";

export const SetStateServiceRequestSchema = z.object({
  isActive: z.boolean()
});

export type SetStateServiceRequest = z.infer<typeof SetStateServiceRequestSchema>;
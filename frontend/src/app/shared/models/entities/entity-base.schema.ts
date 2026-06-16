import z from "zod";

export const EntityId = z.number()
    .int('El ID debe ser un número entero')
    .positive('El ID debe ser un número positivo');

export const MetaSchema = z.object({
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  page: z.number().int().positive(),
  totalPages: z.number().int().nonnegative()
});

export type Meta = z.infer<typeof MetaSchema>;
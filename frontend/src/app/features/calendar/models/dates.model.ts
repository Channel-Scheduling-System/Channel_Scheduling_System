import z from "zod";

export const DayOfWeek = z.enum([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]);
export type DayOfWeek = z.infer<typeof DayOfWeek>;
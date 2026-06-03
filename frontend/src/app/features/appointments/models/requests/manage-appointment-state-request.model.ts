import z from "zod";
import { AppointmentStatus } from "../../../../shared/models/entities/appointment.schema";

export const RejectAppointmentRequestSchema = z.object({
  reason: z.string()
          .max(300, 'El motivo no puede exceder 300 caracteres')
          .optional()
});

const ValidStates = z.enum([
  'IN_PROGRESS',
  'COMPLETED',
  'NO_SHOW',
]);

export const SetAppointmentStateRequestSchema = z.object({
  status: ValidStates
});

export type RejectAppointmentRequest = z.infer<typeof RejectAppointmentRequestSchema>;
export type SetAppointmentStateRequest = z.infer<typeof SetAppointmentStateRequestSchema>;
import z from "zod";
import { AppointmentStatus } from "../../../../shared/models/entities/appointment.schema";

export const RejectAppointmentRequestSchema = z.object({
  reason: z.string()
          .max(300, 'El motivo no puede exceder 300 caracteres')
          .optional()
});

export const SetAppointmentStateRequestSchema = z.object({
  state: AppointmentStatus
});

export type RejectAppointmentRequest = z.infer<typeof RejectAppointmentRequestSchema>;
export type SetAppointmentStateRequest = z.infer<typeof SetAppointmentStateRequestSchema>;
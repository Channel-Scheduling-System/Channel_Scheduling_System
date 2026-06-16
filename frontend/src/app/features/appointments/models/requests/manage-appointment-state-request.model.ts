import z from "zod";


const ValidStates = z.enum([
  'IN_PROGRESS',
  'COMPLETED',
  'NO_SHOW',
]);

export const SetAppointmentStateRequestSchema = z.object({
  status: ValidStates
});

export const CancelAppointmentRequestSchema = z.object({
  reason: z.string()
          .max(300, 'El motivo no puede exceder 300 caracteres')
          .optional()
});

export type SetAppointmentStateRequest = z.infer<typeof SetAppointmentStateRequestSchema>;
export type CancelAppointmentRequest = z.infer<typeof CancelAppointmentRequestSchema>;
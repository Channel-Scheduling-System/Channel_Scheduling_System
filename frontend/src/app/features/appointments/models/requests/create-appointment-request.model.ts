import z from "zod";
import { AppointmentDateTime, AppointmentSchema, AppointmentServiceSchema } from "../../../../shared/models/entities/appointment.schema";
import { EntityId } from "../../../../shared/models/entities/entity-base.schema";

const serviceOverlap = AppointmentServiceSchema.omit({ customPrice: true });

export const VerifyOverlapRequestSchema = z.object({
    workerId: EntityId,
    startAt: AppointmentDateTime,
    services: z.array(serviceOverlap)
});

export const CreateAppointmentRequestSchema = AppointmentSchema;

export type VerifyOverlapRequest = z.infer<typeof VerifyOverlapRequestSchema>;
export type CreateAppointmentRequest = z.infer<typeof CreateAppointmentRequestSchema>;
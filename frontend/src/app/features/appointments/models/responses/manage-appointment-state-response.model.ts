import { BaseSuccessResponseSchema } from "../../../../shared/models/api/success-response.schema";

export const ApproveAppointmentResponseSchema = BaseSuccessResponseSchema;
export const RejectAppointmentResponseSchema = BaseSuccessResponseSchema;
export const CancelAppointmentResponseSchema = BaseSuccessResponseSchema;
export const SetAppointmentStateResponseSchema = BaseSuccessResponseSchema;

export type ApproveAppointmentResponse = ReturnType<typeof ApproveAppointmentResponseSchema.parse>;
export type RejectAppointmentResponse = ReturnType<typeof RejectAppointmentResponseSchema.parse>;
export type CancelAppointmentResponse = ReturnType<typeof CancelAppointmentResponseSchema.parse>;
export type SetAppointmentStateResponse = ReturnType<typeof SetAppointmentStateResponseSchema.parse>;
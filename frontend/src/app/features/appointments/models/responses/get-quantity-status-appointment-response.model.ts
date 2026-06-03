import z from "zod";
import { BaseSuccessResponseSchema} from "../../../../shared/models/api/success-response.schema";

export const GetQuantityStatusAppointmentsResponseSchema = BaseSuccessResponseSchema.extend({
    quantity: z.number(),
});

export type GetQuantityStatusAppointmentsResponse = z.infer<typeof GetQuantityStatusAppointmentsResponseSchema>;
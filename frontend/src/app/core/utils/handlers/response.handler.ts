import { z } from 'zod';
import { Injectable } from '@angular/core';
import {
    SuccessResponseWithData,
    SuccessResponseWithDataSchema,
    BaseSuccessResponseSchema
} from '../../../shared/models/success-response.schema';

@Injectable({ providedIn: 'root' })
export class ResponseHandler {
    handleSuccess<S extends z.ZodTypeAny>(
        response: unknown,
        schema: S
    ):  z.infer<S> {
        return schema.parse(response) as z.infer<S>;
    }

    handleSuccessWithData<T>(
        response: unknown,
        dataSchema: z.ZodTypeAny
    ): T {
        const schema = SuccessResponseWithDataSchema(dataSchema);
        const validated = schema.parse(response) as SuccessResponseWithData<T>;
        return validated.data;
    }

    handleSuccessWithoutData(
        response: unknown
    ): void {
        BaseSuccessResponseSchema.parse(response);
    }
}
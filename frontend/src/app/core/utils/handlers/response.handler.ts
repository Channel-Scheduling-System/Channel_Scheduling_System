import { z } from 'zod';
import { Injectable } from '@angular/core';
import {
    SuccessResponseWithData,
    SuccessResponseWithDataSchema,
    BaseSuccessResponseSchema
} from '../../../shared/models/api/success-response.schema';
import { IResponseHandler } from '../../interfaces/response-handler.interface';

@Injectable({ providedIn: 'root' })
export class ResponseHandler implements IResponseHandler {
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
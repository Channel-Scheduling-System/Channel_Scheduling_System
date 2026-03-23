import { z } from 'zod';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse, ErrorResponseSchema } from '../../../shared/models/api/error-response.schema';
import { Injectable } from '@angular/core';
import { IErrorHandler } from '../../interfaces/error-handler.interface';

@Injectable({ providedIn: 'root' })
export class HttpErrorHandler implements IErrorHandler{
  
  constructor() { }

  handleError(error: unknown): ReturnType<typeof throwError> {
    if (error instanceof z.ZodError) {
      return throwError(() => this.createError('VALIDATION_ERROR', 'Error de formato en la respuesta'));
    }
    if (error instanceof HttpErrorResponse) {
      return this.handleHttpError(error);
    }
    return throwError(() => this.createError('UNKNOWN_ERROR', 'Error inesperado'));
  }

  private handleHttpError(error: HttpErrorResponse): ReturnType<typeof throwError> {
    if (error.status === 0) {
      return throwError(() => this.createError('NETWORK_ERROR', 'No se pudo conectar al servidor'));
    }
    try {
      const apiError = ErrorResponseSchema.parse(error.error);
      return throwError(() => apiError);
    } catch {
      const genericCode = `HTTP_${error.status}`;
      const genericMessage = error.statusText || `Error HTTP ${error.status}`;
      return throwError(() => this.createError(genericCode, genericMessage));
    }
  }

  private createError(code: string, message: string): ErrorResponse {
    return { 
      code,
      message 
    };
  }
}
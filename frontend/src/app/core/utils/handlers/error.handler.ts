import { z } from 'zod';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse, ErrorResponseSchema } from '../../../shared/models/error-response.schema';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HttpErrorHandler {
  
  constructor() { }

  handleError(error: unknown): ReturnType<typeof throwError> {
    if (error instanceof z.ZodError) {
      return throwError(() => this.createError(500, 'Error de formato en la respuesta'));
    }
    if (error instanceof HttpErrorResponse) {
      return this.handleHttpError(error);
    }
    return throwError(() => this.createError(500, 'Error inesperado'));
  }

  private handleHttpError(error: HttpErrorResponse): ReturnType<typeof throwError> {
    if (error.status === 0) {
    }
    try {
      const apiError = ErrorResponseSchema.parse(error.error);
      
      return throwError(() => ({
        ...apiError,
        code: error.status
      }));
    } catch {
      return throwError(() => this.createError(
        error.status,
        error.statusText || `Error HTTP ${error.status}`
      ));
    }
  }

  private createError(code: number, message: string): ErrorResponse & { code: number } {
    return { 
      success: false, 
      code,
      message 
    };
  }
}
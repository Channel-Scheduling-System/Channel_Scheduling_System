// core/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../shared/constants/api-endpoints.constants';
import { ResponseHandler } from '../utils/handlers/response.handler';
import { HttpErrorHandler } from '../utils/handlers/error.handler';
import { AdminExistsResponse, AdminExistsResponseSchema } from '../../shared/models/admin/admin-exists-response.model';
import { IAdminService } from '../interfaces/admin-service.interface';

@Injectable({ providedIn: 'root' })
export class AdminService implements IAdminService{
  constructor(
    private http: HttpClient,
    private responseHandler: ResponseHandler,
    private errorHandler: HttpErrorHandler
  ) {}

  checkAdminExists(): Observable<AdminExistsResponse> {
    return this.http.get(API_ENDPOINTS.ADMIN.EXISTS).pipe(
      map(response => this.responseHandler.handleSuccess(response, AdminExistsResponseSchema)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError} from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constants';
import { ResponseHandler } from '../../../core/utils/handlers/response.handler';
import { HttpErrorHandler } from '../../../core/utils/handlers/error.handler';
import { ServicesListResponse, ServicesListResponseSchema } from '../models/responses/services-list-response.model';

@Injectable({ providedIn: 'root' })
export class ServicesService {
  constructor(
    private http: HttpClient, 
    private responseHandler: ResponseHandler, 
    private errorHandler: HttpErrorHandler
  ) { }
    getServicesByWorker(workerId: number): Observable<ServicesListResponse> {
        return this.http.get(API_ENDPOINTS.SERVICES.BY_WORKER(workerId)).pipe(
            map(response => this.responseHandler.handleSuccess(response, ServicesListResponseSchema)),
            catchError(error => this.errorHandler.handleError(error))
        );
    }
}
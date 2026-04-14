import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constants';
import { ResponseHandler } from '../../../core/utils/handlers/response.handler';
import { HttpErrorHandler } from '../../../core/utils/handlers/error.handler';
import { ServicesListResponse, ServicesListResponseSchema } from '../models/responses/services-list-response.model';
import { CreateServiceRequest, CreateServiceRequestSchema } from '../models/requests/create-service-request.model';
import { CreateServiceResponse, CreateServiceResponseSchema } from '../models/responses/create-service-response.model';
import { UpdateServiceRequest, UpdateServiceRequestSchema } from '../models/requests/update-service-request.model';
import { UpdateServiceResponse, UpdateServiceResponseSchema } from '../models/responses/update-service-response.model';
import { DeleteServiceResponse, DeleteServiceResponseSchema } from '../models/responses/delete-service-response.model';
import { IServicesService } from '../interfaces/services-service.interface';

@Injectable({ providedIn: 'root' })
export class ServicesService implements IServicesService{
    constructor(
        private http: HttpClient,
        private responseHandler: ResponseHandler,
        private errorHandler: HttpErrorHandler
    ) { }
    getServicesByWorker(workerId: number): Observable<ServicesListResponse> {
        return this.http.get(API_ENDPOINTS.SERVICES.BY_WORKER(workerId)).pipe(
        map(response => this.responseHandler.handleSuccess(response, ServicesListResponseSchema))
        );
    }

    createService(request: CreateServiceRequest): Observable<CreateServiceResponse> {
        const validatedRequest = CreateServiceRequestSchema.parse(request);
        return this.http.post(API_ENDPOINTS.SERVICES.CREATE, validatedRequest).pipe(
        map(response => this.responseHandler.handleSuccess(response, CreateServiceResponseSchema))
        );
    }

    updateService(request: UpdateServiceRequest, id: number): Observable<UpdateServiceResponse> {
        const validatedRequest = UpdateServiceRequestSchema.parse(request);
        return this.http.put(API_ENDPOINTS.SERVICES.UPDATE(id), validatedRequest).pipe(
        map(response => this.responseHandler.handleSuccess(response, UpdateServiceResponseSchema))
        );
    }

    deleteService(id: number): Observable<DeleteServiceResponse> {
        return this.http.delete(API_ENDPOINTS.SERVICES.DELETE(id)).pipe(
        map(response => this.responseHandler.handleSuccess(response, DeleteServiceResponseSchema))
        );
    }

}
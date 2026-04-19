import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map} from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constants';
import { ResponseHandler } from '../../../core/utils/handlers/response.handler';
import { ServicesListResponse, ServicesListResponseSchema } from '../models/responses/services-list-response.model';
import { CreateServiceRequest, CreateServiceRequestSchema } from '../models/requests/create-service-request.model';
import { CreateServiceResponse, CreateServiceResponseSchema } from '../models/responses/create-service-response.model';
import { UpdateServiceRequest, UpdateServiceRequestSchema } from '../models/requests/update-service-request.model';
import { UpdateServiceResponse, UpdateServiceResponseSchema } from '../models/responses/update-service-response.model';
import { DeleteServiceResponse, DeleteServiceResponseSchema } from '../models/responses/delete-service-response.model';
import { IServicesService } from '../interfaces/services-service.interface';
import { ServiceFilters } from '../models/requests/service-filters.model';
import { buildServiceHttpParams } from '../utils/service-params.util';
import { SetStateServiceRequest, SetStateServiceRequestSchema } from '../models/requests/set-state-service-request.model';

@Injectable({ providedIn: 'root' })
export class ServicesService implements IServicesService{
    constructor(
        private http: HttpClient,
        private responseHandler: ResponseHandler
    ) { }
    
    public getServices(filters: ServiceFilters): Observable<ServicesListResponse> {
        const httpParams = buildServiceHttpParams(filters);
        return this.http.get(API_ENDPOINTS.SERVICES.LIST, { params: httpParams }).pipe(
        map(response => this.responseHandler.handleSuccess(response, ServicesListResponseSchema))
        );
    }

    public createService(request: CreateServiceRequest): Observable<CreateServiceResponse> {
        const validatedRequest = CreateServiceRequestSchema.parse(request);
        return this.http.post(API_ENDPOINTS.SERVICES.CREATE, validatedRequest).pipe(
        map(response => this.responseHandler.handleSuccess(response, CreateServiceResponseSchema))
        );
    }

    public updateService(request: UpdateServiceRequest, id: number): Observable<UpdateServiceResponse> {
        const validatedRequest = UpdateServiceRequestSchema.parse(request);
        return this.http.put(API_ENDPOINTS.SERVICES.UPDATE(id), validatedRequest).pipe(
        map(response => this.responseHandler.handleSuccess(response, UpdateServiceResponseSchema))
        );
    }

    public setServiceState(id: number, request: SetStateServiceRequest): Observable<DeleteServiceResponse> {
        const validatedRequest = SetStateServiceRequestSchema.parse(request);
        return this.http.patch(API_ENDPOINTS.SERVICES.SET_STATE(id), validatedRequest).pipe(
            map(response => this.responseHandler.handleSuccess(response, DeleteServiceResponseSchema))
        );
    }

}
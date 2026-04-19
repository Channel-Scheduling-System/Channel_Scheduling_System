import { Observable } from 'rxjs';
import { ServicesListResponse } from '../models/responses/services-list-response.model';
import { CreateServiceResponse } from '../models/responses/create-service-response.model';
import { CreateServiceRequest } from '../models/requests/create-service-request.model';
import { UpdateServiceResponse } from '../models/responses/update-service-response.model';
import { UpdateServiceRequest } from '../models/requests/update-service-request.model';
import { DeleteServiceResponse } from '../models/responses/delete-service-response.model';
import { ServiceFilters } from '../models/requests/service-filters.model';
import { SetStateServiceRequest } from '../models/requests/set-state-service-request.model';

export interface IServicesService {
  
  getServices(filters: ServiceFilters): Observable<ServicesListResponse>;

  createService(request: CreateServiceRequest): Observable<CreateServiceResponse>;

  updateService(request: UpdateServiceRequest, id: number): Observable<UpdateServiceResponse>;

  setServiceState(id: number, data: SetStateServiceRequest): Observable<DeleteServiceResponse>;

}
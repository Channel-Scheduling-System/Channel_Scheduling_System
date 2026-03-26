import { Observable } from 'rxjs';
import { ServicesListResponse } from '../models/responses/services-list-response.model';
import { CreateServiceResponse } from '../models/responses/create-service-response';
import { CreateServiceRequest } from '../models/requests/create-service-request';
import { UpdateServiceResponse } from '../models/responses/update-service-response';
import { UpdateServiceRequest } from '../models/requests/update-service-request';

export interface IServicesService {
  
  getServicesByWorker(workerId: number): Observable<ServicesListResponse>;

  createService(request: CreateServiceRequest): Observable<CreateServiceResponse>;

  updateService(request: UpdateServiceRequest): Observable<UpdateServiceResponse>

}
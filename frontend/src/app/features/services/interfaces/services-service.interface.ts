import { Observable } from 'rxjs';
import { ServicesListResponse } from '../models/responses/services-list-response.model';
import { CreateServiceResponse } from '../models/responses/create-service-response.model';
import { CreateServiceRequest } from '../models/requests/create-service-request.model';
import { UpdateServiceResponse } from '../models/responses/update-service-response.model';
import { UpdateServiceRequest } from '../models/requests/update-service-request.model';
import { DeleteServiceResponse } from '../models/responses/delete-service-response.model';

export interface IServicesService {
  
  getServicesByWorker(workerId: number): Observable<ServicesListResponse>;

  createService(request: CreateServiceRequest): Observable<CreateServiceResponse>;

  updateService(request: UpdateServiceRequest, id: number): Observable<UpdateServiceResponse>;

  deleteService(id: number): Observable<DeleteServiceResponse>;

}
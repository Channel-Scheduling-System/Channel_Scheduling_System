import { Observable } from 'rxjs';
import { AdminExistsResponse } from '../../shared/models/admin/admin-exists-response.model';

export interface IAdminService {
  checkAdminExists(): Observable<AdminExistsResponse>;
}
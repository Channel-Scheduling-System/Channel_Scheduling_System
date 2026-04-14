import { Observable } from 'rxjs';
import { LoginRequest } from '../models/requests/login-request.model';
import { LoginResponse } from '../models/responses/login-response.model';

export interface IAuthService {
  
  login(credentials: LoginRequest): Observable<LoginResponse>;

}
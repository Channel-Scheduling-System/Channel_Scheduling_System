import { Observable } from 'rxjs';
import { LoginRequest } from '../models/requests/login-request.model';
import { LoginResponse } from '../models/responses/login-response.model';
import { RegisterClientRequest } from '../models/requests/register-client-request.model';
import { RegisterClientResponse } from '../models/responses/register-client-response.model';

export interface IAuthService {
  
  login(credentials: LoginRequest): Observable<LoginResponse>;

  registerClientAndLogin(request: RegisterClientRequest): Observable<RegisterClientResponse>;

}
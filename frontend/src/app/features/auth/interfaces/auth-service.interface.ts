import { Observable } from 'rxjs';
import { LoginRequest } from '../models/requests/login/login-request.model';
import { LoginResponse } from '../models/responses/login/login-response.model';
import { RegisterRequest } from '../models/requests/register/register-request.model';
import { RegisterResponse } from '../models/responses/register/register-response.model';

export interface IAuthService {
  
  login(credentials: LoginRequest): Observable<LoginResponse>;

  register(credentials: RegisterRequest): Observable<RegisterResponse>;

}
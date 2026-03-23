import { Observable } from 'rxjs';
import { RegisterRequest } from '../models/requests/register/register-request.model';
import { RegisterResponse } from '../models/responses/register/register-response.model';

export interface IUserService {
  
  register(credentials: RegisterRequest): Observable<RegisterResponse>;

}
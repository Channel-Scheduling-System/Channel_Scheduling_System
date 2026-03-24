import { z } from 'zod';
import { Observable } from 'rxjs';
import { RegisterRequest } from '../models/requests/register/register-request.model';
import { RegisterResponse } from '../models/responses/register/register-response.model';

export interface IUserService {
  
  register<T extends RegisterRequest>(
    credentials: T,
    schema: z.ZodTypeAny
  ): Observable<RegisterResponse>;

}
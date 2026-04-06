import { z } from 'zod';
import { Observable } from 'rxjs';
import { RegisterRequest } from '../models/requests/register/register-request.model';
import { RegisterResponse } from '../models/responses/register/register-response.model';
import { ListUsersResponse } from '../models/responses/list/list-users-response.model';

export interface IUserService {
  
  getUsers(
    page: number, 
    identifier: string
  ): Observable<ListUsersResponse>;

  register<T extends RegisterRequest>(
    credentials: T,
    schema: z.ZodTypeAny
  ): Observable<RegisterResponse>;

}
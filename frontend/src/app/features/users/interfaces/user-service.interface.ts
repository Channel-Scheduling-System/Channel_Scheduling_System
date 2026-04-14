import { z } from 'zod';
import { Observable } from 'rxjs';
import { RegisterRequest, RegisterUserRequestSchema } from '../models/requests/register-request.model';
import { RegisterResponse, RegisterUserResponse } from '../models/responses/register-response.model';
import { ListUsersResponse } from '../models/responses/list-users-response.model';
import { GetUserResponse } from '../models/responses/get-user-response.model';
import { UpdateUserResponse } from '../models/responses/update-response.model';
import { UpdateUserRequest } from '../models/requests/update-request.model';
import { SetStateUserResponse } from '../models/responses/set-state-user-response.model';
import { SetStateUserRequest } from '../models/requests/set-state-user-request.model';
import { UserFilters } from '../models/requests/user-filters.model';

export interface IUserService {
  
  register<T extends RegisterRequest>(
    credentials: T,
    schema: z.ZodTypeAny
  ): Observable<RegisterResponse>;

  registerUser(
    data: RegisterUserRequestSchema
  ): Observable<RegisterUserResponse>;
  
  getUsers(
    filters: UserFilters
  ): Observable<ListUsersResponse>;

  getUser(
    userId: number
  ): Observable<GetUserResponse>;

  updateUser(
    userId: number, 
    data: UpdateUserRequest
  ): Observable<UpdateUserResponse>;
  
  setUserState(
    userId: number, 
    data: SetStateUserRequest
  ): Observable<SetStateUserResponse>;

}
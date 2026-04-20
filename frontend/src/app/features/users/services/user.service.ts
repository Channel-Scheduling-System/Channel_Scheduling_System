import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map} from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constants';
import { ResponseHandler } from '../../../core/utils/handlers/response.handler';
import { RegisterUserRequest } from '../models/requests/register-request.model';
import { RegisterUserResponse, RegisterUserResponseSchema } from '../models/responses/register-response.model';
import { IUserService } from '../interfaces/user-service.interface';
import { ListUsersResponse, ListUsersResponseSchema} from '../models/responses/list-users-response.model';
import { GetUserResponse, GetUserResponseSchema } from '../models/responses/get-user-response.model';
import { UpdateUserRequest, UpdateUserRequestSchema } from '../models/requests/update-request.model';
import { UpdateUserResponse, UpdateUserResponseSchema } from '../models/responses/update-response.model';
import { SetStateUserResponse, SetStateUserResponseSchema } from '../models/responses/set-state-user-response.model';
import { SetStateUserRequest, SetStateUserRequestSchema } from '../models/requests/set-state-user-request.model';
import { UserFilters } from '../models/requests/user-filters.model';
import { buildUserHttpParams } from '../utils/user-params.util';

@Injectable({ providedIn: 'root' })
export class UserService implements IUserService {
  constructor(
    private http: HttpClient,
    private responseHandler: ResponseHandler
  ) {}

  public registerUser(data: RegisterUserRequest): Observable<RegisterUserResponse> {
    return this.http.post(API_ENDPOINTS.USERS.REGISTER, data).pipe(
      map(response => this.responseHandler.handleSuccess(response, RegisterUserResponseSchema))
    );
  }

  public getUsers(filters: UserFilters = {}): Observable<ListUsersResponse> {
    const params = buildUserHttpParams(filters);
    return this.http.get(API_ENDPOINTS.USERS.LIST, { params }).pipe(
      map(response => this.responseHandler.handleSuccess(response, ListUsersResponseSchema))
    );
  }

  public getUser(userId: number): Observable<GetUserResponse> {
    return this.http.get(API_ENDPOINTS.USERS.PROFILE(userId)).pipe(
      map(response => this.responseHandler.handleSuccess(response, GetUserResponseSchema))
    );
  }

  public updateUser(userId: number, request: UpdateUserRequest): Observable<UpdateUserResponse> {
    const validatedRequest = UpdateUserRequestSchema.parse(request);
    return this.http.put(API_ENDPOINTS.USERS.UPDATE(userId), validatedRequest).pipe(
      map(response => {
        return this.responseHandler.handleSuccess(response, UpdateUserResponseSchema); })
    );
  }

  public setUserState(userId: number, request: SetStateUserRequest): Observable<SetStateUserResponse> {
    const validatedRequest = SetStateUserRequestSchema.parse(request);
    return this.http.patch(API_ENDPOINTS.USERS.SET_STATE(userId), validatedRequest).pipe(
      map(response => this.responseHandler.handleSuccess(response, SetStateUserResponseSchema))
    );
  }

}
import {z} from 'zod';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constants';
import { ResponseHandler } from '../../../core/utils/handlers/response.handler';
import { TokenService } from '../../../core/services/token.service';
import { SessionService } from '../../../core/services/session.service';
import { RegisterRequest, RegisterUserRequestSchema } from '../models/requests/register-request.model';
import { RegisterResponse, RegisterResponseSchema, RegisterUserResponse, RegisterUserResponseSchema } from '../models/responses/register-response.model';
import { IUserService } from '../interfaces/user-service.interface';
import { ListUsersResponse, ListUsersResponseSchema } from '../models/responses/list-users-response.model';
import { GetUserResponse, GetUserResponseSchema } from '../models/responses/get-user-response.model';
import { UpdateUserRequest } from '../models/requests/update-request.model';
import { UpdateUserResponse, UpdateUserResponseSchema } from '../models/responses/update-response.model';
import { SetStateUserResponse, SetStateUserResponseSchema } from '../models/responses/set-state-user-response.model';
import { SetStateUserRequest } from '../models/requests/set-state-user-request.model';
import { UserFilters } from '../models/requests/user-filters.model';
import { buildUserHttpParams } from '../utils/user-params.util';

@Injectable({ providedIn: 'root' })
export class UserService implements IUserService {
  constructor(
    private http: HttpClient,
    private responseHandler: ResponseHandler,
    private tokenService: TokenService,
    private sessionService: SessionService
  ) {}

  public register<T extends RegisterRequest>(
    credentials: T,
    schema: z.ZodTypeAny
  ): Observable<RegisterResponse> {
    const validatedRequest = schema.parse(credentials);
    return this.http.post(API_ENDPOINTS.AUTH.REGISTER, validatedRequest).pipe(
      map(response => this.responseHandler.handleSuccess(response, RegisterResponseSchema)),
      tap((response: RegisterResponse) => {
        this.tokenService.setToken(response.data.token);
        this.sessionService.setSession(response.data.user);
      })
    );
  }

  public registerUser(data: RegisterUserRequestSchema): Observable<RegisterUserResponse> {
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

  public updateUser(userId: number, data: UpdateUserRequest): Observable<UpdateUserResponse> {
    return this.http.put(API_ENDPOINTS.USERS.UPDATE(userId), data).pipe(
      map(response => { 
        console.log('Raw response from update user API:', response);
        return this.responseHandler.handleSuccess(response, UpdateUserResponseSchema); })
    );
  }

  public setUserState(userId: number, data: SetStateUserRequest): Observable<SetStateUserResponse> {
    return this.http.patch(API_ENDPOINTS.USERS.SET_STATE(userId), data).pipe(
      map(response => this.responseHandler.handleSuccess(response, SetStateUserResponseSchema))
    );
  }

}
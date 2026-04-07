import {z} from 'zod';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constants';
import { ResponseHandler } from '../../../core/utils/handlers/response.handler';
import { HttpErrorHandler } from '../../../core/utils/handlers/error.handler';
import { TokenService } from '../../../core/services/token.service';
import { SessionService } from '../../../core/services/session.service';
import { RegisterRequest, RegisterUserRequestSchema } from '../models/requests/register/register-request.model';
import { RegisterResponse, RegisterResponseSchema, RegisterUserResponse, RegisterUserResponseSchema } from '../models/responses/register/register-response.model';
import { IUserService } from '../interfaces/user-service.interface';
import { ListUsersResponse, ListUsersResponseSchema } from '../models/responses/list/list-users-response.model';
import { GetProfileResponse, GetProfileResponseSchema } from '../../profile/models/responses/get-profile/get-profile-response.model';

@Injectable({ providedIn: 'root' })
export class UserService implements IUserService {
  constructor(
    private http: HttpClient,
    private responseHandler: ResponseHandler,
    private errorHandler: HttpErrorHandler,
    private tokenService: TokenService,
    private sessionService: SessionService
  ) {}

  register<T extends RegisterRequest>(
    credentials: T,
    schema: z.ZodTypeAny
  ): Observable<RegisterResponse> {
    const validatedRequest = schema.parse(credentials);
    return this.http.post(API_ENDPOINTS.AUTH.REGISTER, validatedRequest).pipe(
      map(response => this.responseHandler.handleSuccess(response, RegisterResponseSchema)),
      tap((response: RegisterResponse) => {
        this.tokenService.setToken(response.data.token);
        this.sessionService.setSession(response.data.user);
      }),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  registerUser(data: RegisterUserRequestSchema): Observable<RegisterUserResponse> {
    return this.http.post(API_ENDPOINTS.USERS.REGISTER, data).pipe(
      map(response => this.responseHandler.handleSuccess(response, RegisterUserResponseSchema)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  getUsers(page: number = 1, identifier: string = ''): Observable<ListUsersResponse> {
    return this.http.get(API_ENDPOINTS.USERS.LIST(page, identifier)).pipe(
      map(response => this.responseHandler.handleSuccess(response, ListUsersResponseSchema)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  getUserById(userId: number): Observable<GetProfileResponse> {
    const url = API_ENDPOINTS.USERS.PROFILE(userId);
    return this.http.get(url).pipe(
      map(response => this.responseHandler.handleSuccess(response, GetProfileResponseSchema)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

}
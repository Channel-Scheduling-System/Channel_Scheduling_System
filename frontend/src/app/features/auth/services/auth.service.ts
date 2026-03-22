import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constants';
import { LoginRequest, LoginRequestSchema } from '../models/requests/login/login-request.model';
import { LoginResponse, LoginResponseSchema } from '../models/responses/login/login-response.model';
import { ResponseHandler } from '../../../core/utils/handlers/response.handler';
import { HttpErrorHandler } from '../../../core/utils/handlers/error.handler';
import { TokenService } from '../../../core/services/token.service';
import { SessionService } from '../../../core/services/session.service';
import { IAuthService} from '../interfaces/auth-service.interface';
import { RegisterRequest, RegisterRequestBaseSchema } from '../models/requests/register/register-request.model';
import { RegisterResponse, RegisterResponseSchema } from '../models/responses/register/register-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService implements IAuthService{

  constructor(
    private http: HttpClient,
    private responseHandler: ResponseHandler,
    private errorHandler: HttpErrorHandler,
    private tokenService: TokenService,
    private sessionService: SessionService
  ) { }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const validatedRequest = LoginRequestSchema.parse(credentials);
    return this.http.post(API_ENDPOINTS.AUTH.LOGIN, validatedRequest).pipe(
      map(response => this.responseHandler.handleSuccess(response, LoginResponseSchema)),
      tap((response: LoginResponse) => {
        this.tokenService.setToken(response.data.token);
      }),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  register(credentials: RegisterRequest): Observable<RegisterResponse> {
    const validatedRequest = RegisterRequestBaseSchema.parse(credentials);
    return this.http.post(API_ENDPOINTS.AUTH.REGISTER, validatedRequest).pipe(
      map(response => this.responseHandler.handleSuccess(response, RegisterResponseSchema)),
      tap((response: RegisterResponse) => {
        this.tokenService.setToken(response.data.token);
        this.sessionService.setSession(response.data.user);
      }),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

}
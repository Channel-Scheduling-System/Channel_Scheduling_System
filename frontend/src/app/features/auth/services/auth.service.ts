import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constants';
import { LoginRequest, LoginRequestSchema } from '../models/requests/login-request.model';
import { LoginResponse, LoginResponseSchema } from '../models/responses/login-response.model';
import { ResponseHandler } from '../../../core/utils/handlers/response.handler';
import { HttpErrorHandler } from '../../../core/utils/handlers/error.handler';
import { AccessTokenService } from '../../../core/services/access-token.service';
import { IAuthService } from '../interfaces/auth-service.interface';
import { SessionService } from '../../../core/services/session.service';
import { RegisterFirstAdminRequest, RegisterFirstAdminRequestSchema } from '../models/requests/register-first-admin-request.model';
import { RegisterFirstAdminResponse, RegisterFirstAdminResponseSchema } from '../models/responses/register-first-admin-response.model';
import { RegisterClientRequest, RegisterClientRequestSchema } from '../models/requests/register-client-request.model';
import { RegisterClientResponse, RegisterClientResponseSchema } from '../models/responses/register-client-response.model';
import { PasswordRecoveryRequest, PasswordRecoveryRequestSchema } from '../models/requests/recovery-password-request.model';
import { SendRecoveryCodeRequest, SendRecoveryCodeRequestSchema } from '../models/requests/send-code-requests.model';
import { VerifyRecoveryCodeRequest, VerifyRecoveryCodeRequestSchema } from '../models/requests/verify-code-request.model';
import { PasswordRecoveryResponse, PasswordRecoveryResponseSchema } from '../models/responses/recovery-password-response.model';
import { SendRecoveryCodeResponse, SendRecoveryCodeResponseSchema } from '../models/responses/send-code-response.model';
import { VerifyRecoveryCodeResponse, VerifyRecoveryCodeResponseSchema } from '../models/responses/verify-code-response.model';
import { ResetTokenService } from '../../../core/services/reset-token.service';

@Injectable({ providedIn: 'root' })
export class AuthService implements IAuthService {
  constructor(
    private http: HttpClient,
    private responseHandler: ResponseHandler,
    private errorHandler: HttpErrorHandler,
    private accessTokenService: AccessTokenService,
    private resetTokenService: ResetTokenService,
    private sessionService: SessionService
  ) { }

  public login(request: LoginRequest): Observable<LoginResponse> {
    const validatedRequest = LoginRequestSchema.parse(request);
    return this.http.post(API_ENDPOINTS.AUTH.LOGIN, validatedRequest, {
      withCredentials: true
    }).pipe(
      map(response => this.responseHandler.handleSuccess(response, LoginResponseSchema)),
      tap((response: LoginResponse) => {
        this.accessTokenService.setToken(response.data.token);
        this.sessionService.setSession(response.data.user);
      }),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  public registerFirstAdmin(request: RegisterFirstAdminRequest): Observable<RegisterFirstAdminResponse> {
    const validatedRequest = RegisterFirstAdminRequestSchema.parse(request);
    return this.http.post(API_ENDPOINTS.AUTH.REGISTER_FIRST_ADMIN, validatedRequest).pipe(
      map(response => this.responseHandler.handleSuccess(response, RegisterFirstAdminResponseSchema)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  public registerClientAndLogin(request: RegisterClientRequest): Observable<RegisterClientResponse> {
    const validatedRequest = RegisterClientRequestSchema.parse(request);
    return this.http.post(API_ENDPOINTS.AUTH.REGISTER, validatedRequest, {
      withCredentials: true
    }).pipe(
      map(response => this.responseHandler.handleSuccess(response, RegisterClientResponseSchema)),
      tap((response: RegisterClientResponse) => {
        this.accessTokenService.setToken(response.data.token);
        this.sessionService.setSession(response.data.user);
      }),
      catchError(error => {
        return this.errorHandler.handleError(error);
      })
    );
  }

  sendRecoveryCode(request: SendRecoveryCodeRequest): Observable<SendRecoveryCodeResponse> {
    const validatedRequest = SendRecoveryCodeRequestSchema.parse(request);
    return this.http.post(API_ENDPOINTS.AUTH.RECOVERY_SEND_CODE, validatedRequest).pipe(
      map(response => this.responseHandler.handleSuccess(response, SendRecoveryCodeResponseSchema)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }
  
  verifyRecoveryCode(request: VerifyRecoveryCodeRequest): Observable<VerifyRecoveryCodeResponse> {
    const validatedRequest = VerifyRecoveryCodeRequestSchema.parse(request);
    return this.http.post(API_ENDPOINTS.AUTH.RECOVERY_VERIFY_CODE, validatedRequest).pipe(
      map(response => this.responseHandler.handleSuccess(response, VerifyRecoveryCodeResponseSchema)),
      tap((response: VerifyRecoveryCodeResponse) => {
        this.resetTokenService.setToken(response.resetToken);
      }),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  recoveryPassword(request: PasswordRecoveryRequest): Observable<PasswordRecoveryResponse> {
    const validatedRequest = PasswordRecoveryRequestSchema.parse(request);
    const headers = this.buildRecoveryHeaders();
    return this.http.post(API_ENDPOINTS.AUTH.RECOVERY_RESET_PASSWORD, validatedRequest, { headers }).pipe(
      map(response => this.responseHandler.handleSuccess(response, PasswordRecoveryResponseSchema)),
      tap(() => this.resetTokenService.clearToken()),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  private buildRecoveryHeaders() {
    const token = this.resetTokenService.getToken();
    return { Authorization: `Bearer ${token}` };
  }

}
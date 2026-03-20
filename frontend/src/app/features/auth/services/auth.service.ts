import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constants';
import { LoginRequest, LoginRequestSchema } from '../models/requests/login/login-request.model';
import { LoginResponse, LoginResponseSchema } from '../models/responses/login/login-response.model';
import { ResponseHandler } from '../../../core/utils/handlers/response.handler';
import { HttpErrorHandler } from '../../../core/utils/handlers/error.handler';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessToken: string | null = null;

  constructor(
    private http: HttpClient,
    private responseHandler: ResponseHandler,
    private errorHandler: HttpErrorHandler
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const validatedRequest = LoginRequestSchema.parse(credentials);
    return this.http.post(API_ENDPOINTS.AUTH.LOGIN, validatedRequest).pipe(
      map(response => this.responseHandler.handleSuccess(response, LoginResponseSchema)),
      tap((response: LoginResponse) => {
        this.accessToken = response.data.token;
      }),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  getToken(): string | null {
    return this.accessToken;
  }

  initAuth(): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(API_ENDPOINTS.AUTH.REFRESH, {}, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.accessToken = response.token;
      })
    );
  }

  logout(): void {
    this.accessToken = null;
    this.http.post(API_ENDPOINTS.AUTH.LOGOUT, {}, { withCredentials: true }).subscribe();
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

}
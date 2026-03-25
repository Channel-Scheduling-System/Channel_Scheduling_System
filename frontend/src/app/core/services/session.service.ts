import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { map, catchError, tap } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../shared/constants/api-endpoints.constants';
import { HttpErrorHandler } from '../utils/handlers/error.handler';
import { TokenService } from './token.service';
import { LogoutResponse, LogoutResponseSchema } from '../../shared/models/auth/logout-response.model';
import { RefreshResponse, RefreshResponseSchema } from '../../shared/models/auth/refresh-response.model';
import { HeaderService } from './header.service';
import { ResponseHandler } from '../utils/handlers/response.handler';
import { ISessionService } from '../interfaces/session-service.interface';
import { Session } from '../../shared/models/entities/session.schema';

@Injectable({ providedIn: 'root' })
export class SessionService implements ISessionService {
  constructor(
    private http: HttpClient,
    private responseHandler: ResponseHandler,
    private errorHandler: HttpErrorHandler,
    private tokenService: TokenService,
    private headerService: HeaderService,
    private router: Router
  ) { }

  

  private session: Session | null = null;

  initAuth(): Observable<RefreshResponse> {
    return this.http.post(API_ENDPOINTS.AUTH.REFRESH, {}, {
      withCredentials: true
    }).pipe(
      map(response => this.responseHandler.handleSuccess(response, RefreshResponseSchema)),
      tap((response: RefreshResponse) => {
        this.setSession(response.data.user);
        this.tokenService.setToken(response.data.token);
      }),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  logout(): Observable<LogoutResponse> {
    const headers = this.headerService.getHeadersWithAuth();
    if (!headers) {
      this.router.navigate(['/auth/login']);
      return of({ message: 'Sesión ya cerrada' } as LogoutResponse);
    }
    return this.http.post(API_ENDPOINTS.AUTH.LOGOUT, {}, {
      headers, withCredentials: true
    }).pipe(
      map(response => {
        return this.responseHandler.handleSuccess(response, LogoutResponseSchema);
      }),
      tap(() => {
        this.clearSession();
        this.router.navigate(['/auth/login']);
      }),
      catchError(error => {
        this.clearSession();
        return this.errorHandler.handleError(error);
      })
    );
  }

  isAuthenticated(): boolean {
    return this.session != null;;
  }

  setSession(session: Session): void {
    this.session = session;
  }

  getSession(): Session | null {
    return this.session;
  }

  getRole(): string | null {
    return this.session?.role || null;
  }

  getUserId(): number | null {
    return this.session?.id || null;
  }

  clearSession(): void {
    this.session = null;
    this.tokenService.clearToken();
  }

}
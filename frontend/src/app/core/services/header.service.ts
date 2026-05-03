import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AccessTokenService } from './access-token.service';
import { IHeaderService } from '../interfaces/header-service.interface';

@Injectable({
  providedIn: 'root'
})
export class HeaderService implements IHeaderService {
  
  constructor(
    private router: Router,
    private accessTokenService: AccessTokenService,
  ) {}

  getHeaders(): HttpHeaders {
    const token = this.accessTokenService.getToken();
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      return headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  getHeadersWithAuth(): HttpHeaders | null {
    const token = this.accessTokenService.getToken();
    
    if (!token) {
      return null;
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  withAuth<T>(requestFn: (headers: HttpHeaders) => Observable<T>, errorResponse: T): Observable<T> {
    const headers = this.getHeadersWithAuth();
    
    if (!headers) {
      return this.handleAuthError(errorResponse);
    }
    
    return requestFn(headers);
  }

  
  private handleAuthError<T>(errorResponse: T): Observable<T> {
    this.router.navigate(['/auth/login']);
    return of(errorResponse);
  }

}
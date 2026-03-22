import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { IHeaderService } from '../interfaces/header-service.interface';

@Injectable({
  providedIn: 'root'
})
export class HeaderService implements IHeaderService {
  
  constructor(
    private router: Router,
    private tokenService: TokenService,
  ) {}

  getHeaders(): HttpHeaders {
    const token = this.tokenService.getToken();
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      return headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  getHeadersWithAuth(): HttpHeaders | null {
    const token = this.tokenService.getToken();
    
    if (!token) {
      return null;
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}
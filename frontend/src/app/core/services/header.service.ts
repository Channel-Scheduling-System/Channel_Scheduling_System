import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertType } from '../utils/enums/AlertType';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  
  constructor(
    private router: Router,
    private message: MessageService
  ) {}

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      console.warn('No hay un token válido');
      this.message.showMessage('Sesión expirada', AlertType.ERROR);
      this.goToLogin();
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    });
  }

  private goToLogin(): void {
    setTimeout(() => {
      this.router.navigate(['/auth/login']);
    }, 1000);
  }
}
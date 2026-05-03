import { Injectable } from '@angular/core';
import { ITokenProvider } from '../interfaces/token-service.interface';

@Injectable({ providedIn: 'root' })
export class ResetTokenService implements ITokenProvider {
  private resetToken: string | null = null;

  setToken(token: string): void {
    this.resetToken = token;
  }

  getToken(): string | null {
    return this.resetToken;
  }

  clearToken(): void {
    this.resetToken = null;
  }

  hasToken(): boolean {
    return !!this.resetToken;
  }
  
}
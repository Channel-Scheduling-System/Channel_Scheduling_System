import { Injectable } from '@angular/core';
import { ITokenProvider } from '../interfaces/token-service.interface';
import { Session } from '../../shared/models/entities/session.schema';

@Injectable({ providedIn: 'root' })
export class TokenService implements ITokenProvider {
  private accessToken: string | null = null;
  private session: Session | null = null;

  setToken(token: string): void {
    this.accessToken = token;
  }

  getToken(): string | null {
    return this.accessToken;
  }

  clearToken(): void {
    this.accessToken = null;
  }

  hasToken(): boolean {
    return !!this.accessToken;
  }
  
}
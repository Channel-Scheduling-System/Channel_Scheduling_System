import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AccessTokenService } from '../services/access-token.service';
import { SessionService } from '../services/session.service';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private accessTokenService: AccessTokenService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.sessionService.isAuthReady().pipe(
      map(() => {
        if (this.accessTokenService.hasToken() && this.sessionService.isAuthenticated()) {
          return true;
        }
        this.router.navigate(['/auth/login']);
        return false;
      })
    );
  }
}
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SessionService } from '../services/session.service';
import { AccessTokenService } from '../services/access-token.service';
import { map } from 'rxjs/internal/operators/map';

export const noAuthGuard: CanActivateFn = () => {
  const sessionService = inject(SessionService);
  const accessTokenService = inject(AccessTokenService);
  const router = inject(Router);

  return sessionService.isAuthReady().pipe(
    map(() => {
      if (accessTokenService.hasToken() && sessionService.isAuthenticated()) {
        router.navigate(['/home']);
        return false;
      }
      return true;
    })
  );
};
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SessionService } from '../services/session.service';
import { TokenService } from '../services/token.service';
import { map } from 'rxjs/internal/operators/map';

export const noAuthGuard: CanActivateFn = () => {
  const sessionService = inject(SessionService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  return sessionService.isAuthReady().pipe(
    map(() => {
      if (tokenService.hasToken() && sessionService.isAuthenticated()) {
        router.navigate(['/home']);
        return false;
      }
      return true;
    })
  );
};
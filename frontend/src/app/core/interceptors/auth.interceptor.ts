import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { SessionService } from '../services/session.service';
import { HeaderService } from '../services/header.service';
import { catchError, switchMap, map } from 'rxjs';
import { Router } from '@angular/router';
import { HttpErrorHandler } from '../utils/handlers/error.handler';
import { ResponseHandler } from '../utils/handlers/response.handler';
import { RefreshResponseSchema } from '../../shared/models/auth/refresh-response.model';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const sessionService = inject(SessionService);
  const headerService = inject(HeaderService);
  const router = inject(Router);
  const errorHandler = inject(HttpErrorHandler);
  
  const token = tokenService.getToken();

  if (req.url.includes('/auth/') || req.url.includes('/admin/')) {
    return next(req);
  }

  const authReq = token 
    ? req.clone({ headers: headerService.getHeaders() })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        return sessionService.initAuth().pipe(
          switchMap(() => {
            const newAuthReq = req.clone({
              headers: headerService.getHeaders()
            });
            return next(newAuthReq);
          }),
          catchError((refreshError) => {
            router.navigate(['/auth/login']);
            return errorHandler.handleError(refreshError);
          })
        );
      }
      return errorHandler.handleError(error);
    })
  );
};
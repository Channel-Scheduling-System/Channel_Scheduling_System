import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AccessTokenService } from '../services/access-token.service';
import { SessionService } from '../services/session.service';
import { HeaderService } from '../services/header.service';
import { catchError, switchMap, map, EMPTY } from 'rxjs';
import { Router } from '@angular/router';
import { HttpErrorHandler } from '../utils/handlers/error.handler';
import { MessageService } from '../services/message.service';
import { AlertType } from '../utils/enums/AlertType';

const NON_RECOVERABLE_CODES = ['UNAUTHORIZED_ERROR', 'TOKEN_REUSE_ERROR'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const accessTokenService = inject(AccessTokenService);
  const sessionService = inject(SessionService);
  const router = inject(Router);
  const headerService = inject(HeaderService);
  const errorHandler = inject(HttpErrorHandler);
  const messageService = inject(MessageService);

  const token = accessTokenService.getToken();

  if (req.url.includes('/auth/') || req.url.includes('/admin/')) {
    return next(req);
  }

  const authReq = token
    ? req.clone({ headers: headerService.getHeaders() })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        const nonRecoverable = handleUnauthorized(error, sessionService, router, messageService);
        if (nonRecoverable) return nonRecoverable;
        return sessionService.initAuth().pipe(
          switchMap(() => {
            const newAuthReq = req.clone({
              headers: headerService.getHeaders()
            });
            return next(newAuthReq);
          })
        );
      }
      return errorHandler.handleError(error);
    })
  );
};

function handleUnauthorized(error: any, sessionService: SessionService, router: Router, messageService: MessageService) {
  const errorCode = error.error?.code;

  if (NON_RECOVERABLE_CODES.includes(errorCode)) {
    sessionService.clearSession();
    messageService.showMessage(error.error.message, AlertType.ERROR); 
    router.navigate(['/auth/login']);
    return EMPTY;
  }

  return null;
}
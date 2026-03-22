import { Observable } from 'rxjs';
import { RefreshResponse } from '../../shared/models/auth/refresh-response.model';
import { LogoutResponse } from '../../shared/models/auth/logout-response.model';

export interface ISessionService {
  
  initAuth(): Observable<RefreshResponse>;

  logout(): Observable<LogoutResponse>;

  isAuthenticated(): boolean;
}
import { HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';

export interface IHeaderService {
  
  getHeaders(): HttpHeaders;

  getHeadersWithAuth(): HttpHeaders | null;

  withAuth<T>(requestFn: (headers: HttpHeaders) => Observable<T>, errorResponse: T): Observable<T>

}
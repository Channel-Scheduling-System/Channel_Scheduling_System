import { Observable } from 'rxjs';

export interface IErrorHandler {
  handleError(error: unknown): Observable<never>;
}
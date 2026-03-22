import { HttpHeaders } from '@angular/common/http';

export interface IHeaderService {
  
  getHeaders(): HttpHeaders;

  getHeadersWithAuth(): HttpHeaders | null;
}
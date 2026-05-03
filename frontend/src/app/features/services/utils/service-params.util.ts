import { HttpParams } from '@angular/common/http';
import { ServiceFilters } from '../models/requests/service-filters.model';

export function buildServiceHttpParams(filters: ServiceFilters): HttpParams {
  const { workerId, isActive } = filters;

  let params = new HttpParams();

  if (workerId !== undefined) {
    params = params.set('workerId', String(workerId));
  }

  if (isActive !== undefined) {
    params = params.set('isActive', String(isActive));
  }

  return params;
}
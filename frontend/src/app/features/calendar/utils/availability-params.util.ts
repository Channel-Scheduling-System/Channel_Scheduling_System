import { HttpParams } from '@angular/common/http';
import { AvailabilityConfigParamsRequest } from '../models/requests/availability-params-request.model';
import { WorkerAvailabilityParamsRequest } from '../models/requests/worker-availability-params-request.model';
export function buildAvailabilityConfigHttpParams(
  params: AvailabilityConfigParamsRequest
): HttpParams {
  const { include, view, date } = params;
  let httpParams = new HttpParams();
  if (include !== undefined && include.length > 0) {
    httpParams = httpParams.set('include', include.join(','));
  }
  if (view !== undefined) {
    httpParams = httpParams.set('view', view);
  }
  if (date !== undefined) {
    httpParams = httpParams.set('date', date);
  }
  return httpParams;
}

export function buildWorkerAvailabilityHttpParams(
  params: WorkerAvailabilityParamsRequest
): HttpParams {
  const { view, date } = params;
  let httpParams = new HttpParams();

  if (view !== undefined) {
    httpParams = httpParams.set('view', view);
  }

  if (date !== undefined) {
    httpParams = httpParams.set('date', date);
  }

  return httpParams;
}
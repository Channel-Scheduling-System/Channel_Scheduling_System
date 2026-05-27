import { HttpParams } from '@angular/common/http';
import {
  AppointmentsParamsHistoryRequest,
  AppointmentsActiveParamsRequest
} from '../models/requests/appointments-params-request.model';

export function buildAppointmentsHistoryHttpParams(
  params: AppointmentsParamsHistoryRequest
): HttpParams {
  const { workerId, clientId, status, from, to, page, limit } = params;

  let httpParams = new HttpParams();

  if (workerId !== undefined) {
    httpParams = httpParams.set('workerId', String(workerId));
  }

  if (clientId !== undefined) {
    httpParams = httpParams.set('clientId', String(clientId));
  }

  if (status && status.length > 0) {
    httpParams = httpParams.set('status', status.join(', '));
  }

  if (from !== undefined) {
    httpParams = httpParams.set('from', from);
  }

  if (to !== undefined) {
    httpParams = httpParams.set('to', to);
  }

  if (page !== undefined) {
    httpParams = httpParams.set('page', String(page));
  }

  if (limit !== undefined) {
    httpParams = httpParams.set('limit', String(limit));
  }

  return httpParams;
}

export function buildAppointmentsActiveHttpParams(
  params: AppointmentsActiveParamsRequest
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

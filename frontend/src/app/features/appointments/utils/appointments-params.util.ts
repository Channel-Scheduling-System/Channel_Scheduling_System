import { HttpParams } from '@angular/common/http';
import {
  AppointmentsParamsHistoryRequest,
  AppointmentsActiveParamsRequest
} from '../models/requests/appointments-params-request.model';

export function buildAppointmentsHistoryHttpParams(
  params: AppointmentsParamsHistoryRequest
): HttpParams {
  const { workerId, clientId, status, from, to, page, limit, compact } = params;

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

  if (compact !== undefined) {
    httpParams = httpParams.set('compact', String(compact));
  }

  httpParams = httpParams.set('active', 'true');

  return httpParams;
}

export function buildAppointmentsActiveHttpParams(
  params: AppointmentsActiveParamsRequest
): HttpParams {
  const { view, date, clientId } = params;

  let httpParams = new HttpParams();

  if (view !== undefined) {
    httpParams = httpParams.set('view', view);
  }

  if (date !== undefined) {
    httpParams = httpParams.set('date', date);
  }

  if (clientId !== undefined) {
    httpParams = httpParams.set('clientId', String(clientId));
  }

  return httpParams;
}

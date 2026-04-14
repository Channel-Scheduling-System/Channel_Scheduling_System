import { HttpParams } from '@angular/common/http';
import { UserFilters } from '../models/requests/user-filters.model';

export function buildUserHttpParams(filters: UserFilters): HttpParams {
  const { page, identifier, role, isActive } = filters;

  let params = new HttpParams().set('page', String(page ?? 1));

  if (identifier?.trim()) {
    params = params.set('identifier', identifier.trim());
  }

  if (role && role !== 'ALL') {
    params = params.set('role', role);
  }

  if (isActive !== undefined) {
    params = params.set('isActive', String(isActive));
  }

  return params;
}
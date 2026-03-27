import { environment } from '../../../environments/environment';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${environment.apiUrl}/auth/login`,
    REGISTER: `${environment.apiUrl}/auth/register`,
    REFRESH: `${environment.apiUrl}/auth/refresh`,
    LOGOUT: `${environment.apiUrl}/auth/logout`,
    ADMIN_EXISTS: `${environment.apiUrl}/auth/admin/exists`
  },
  SERVICES: {
    LIST: `${environment.apiUrl}/services`,
    GET: (id: number) => `${environment.apiUrl}/services/${id}`,
    BY_WORKER: (workerId: number) => `${environment.apiUrl}/services?workerId=${workerId}`,
    CREATE: `${environment.apiUrl}/services`,
    UPDATE: `${environment.apiUrl}/services`,
    DELETE: (id: number) => `${environment.apiUrl}/services/${id}`,
  },
  USERS: {
    PROFILE: `${environment.apiUrl}/users/profile`,
    UPDATE: (id: number) => `${environment.apiUrl}/users/${id}`
  }
} as const;
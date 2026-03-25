import { environment } from '../../../environments/environment';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${environment.apiUrl}/auth/login`,
    REGISTER: `${environment.apiUrl}/auth/register`,
    REFRESH: `${environment.apiUrl}/auth/refresh`,
    LOGOUT: `${environment.apiUrl}/auth/logout`
  },
  SERVICES: {
    LIST: `${environment.apiUrl}/services`,
    GET: (id: number) => `${environment.apiUrl}/services/${id}`,
    BY_WORKER: (workerId: number) => `${environment.apiUrl}/services?workerId=${workerId}`,
    CREATE: `${environment.apiUrl}/services`
  },
  ADMIN: {
    EXISTS: `${environment.apiUrl}/admin/exists`
  },
  USERS: {
    PROFILE: `${environment.apiUrl}/users/profile`,
    UPDATE: (id: number) => `${environment.apiUrl}/users/${id}`
  }
} as const;
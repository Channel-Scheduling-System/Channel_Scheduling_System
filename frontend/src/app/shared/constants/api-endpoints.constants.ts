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
    CREATE: `${environment.apiUrl}/services`,
    UPDATE: (id: number) => `${environment.apiUrl}/services/${id}`,
    SET_STATE: (id: number) => `${environment.apiUrl}/services/${id}/status`,
  },
  USERS: {
    PROFILE: (id: number) => `${environment.apiUrl}/users/${id}`,
    LIST: `${environment.apiUrl}/users`,
    REGISTER:  `${environment.apiUrl}/users`,
    UPDATE: (id: number) => `${environment.apiUrl}/users/${id}`,
    SET_STATE: (id: number) => `${environment.apiUrl}/users/${id}/status`,
    DEACTIVATE: `${environment.apiUrl}/users/me/deactivate`,
    RESET_PASSWORD: (id: number) => `${environment.apiUrl}/users/${id}/password`
  }
} as const;
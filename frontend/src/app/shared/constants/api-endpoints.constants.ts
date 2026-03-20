import { environment } from '../../../environments/environment';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${environment.apiUrl}/auth/login`,
    REGISTER: `${environment.apiUrl}/auth/register`,
    REFRESH: `${environment.apiUrl}/auth/refresh`,
    LOGOUT: `${environment.apiUrl}/auth/logout`
  },
  USERS: {
    PROFILE: `${environment.apiUrl}/users/profile`,
    UPDATE: (id: number) => `${environment.apiUrl}/users/${id}`
  }
} as const;
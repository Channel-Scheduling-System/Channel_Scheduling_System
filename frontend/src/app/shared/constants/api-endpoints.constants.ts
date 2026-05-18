import { environment } from '../../../environments/environment';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${environment.apiUrl}/auth/login`,
    REGISTER: `${environment.apiUrl}/auth/register`,
    REFRESH: `${environment.apiUrl}/auth/refresh`,
    LOGOUT: `${environment.apiUrl}/auth/logout`,
    ADMIN_EXISTS: `${environment.apiUrl}/auth/admin/exists`,
    REGISTER_FIRST_ADMIN: `${environment.apiUrl}/users/admin/first`,
    RECOVERY_SEND_CODE: `${environment.apiUrl}/auth/password-reset/request`,
    RECOVERY_VERIFY_CODE: `${environment.apiUrl}/auth/password-reset/verify`,
    RECOVERY_RESET_PASSWORD: `${environment.apiUrl}/auth/password-reset/reset`
  },
  CALENDAR: {
    AVAILABILITY_CONFIG: (id: number) => `${environment.apiUrl}/availability/${id}/config`,
  },
  SERVICES: {
    LIST: `${environment.apiUrl}/services`,
    GET: (id: number) => `${environment.apiUrl}/services/${id}`,
    CREATE: `${environment.apiUrl}/services`,
    UPDATE: (id: number) => `${environment.apiUrl}/services/${id}`,
    SET_STATE: (id: number) => `${environment.apiUrl}/services/${id}/state`,
  },
  USERS: {
    PROFILE: (id: number) => `${environment.apiUrl}/users/${id}`,
    LIST: `${environment.apiUrl}/users`,
    REGISTER:  `${environment.apiUrl}/users`,
    UPDATE: (id: number) => `${environment.apiUrl}/users/${id}`,
    SET_STATE: (id: number) => `${environment.apiUrl}/users/${id}/state`,
    DEACTIVATE: `${environment.apiUrl}/users/me/deactivate`,
    RESET_PASSWORD: (id: number) => `${environment.apiUrl}/users/${id}/password`
  }
} as const;
// core/services/role.service.ts
import { Injectable } from '@angular/core';
import { Role, ROLES } from '../constants/roles.constants';

@Injectable({ providedIn: 'root' })
export class RoleService {
  readonly allRoles = ROLES;

  normalizeRole(role: string | null | undefined): string | null {
    if (!role) return null;
    const normalized = role.trim().toUpperCase();
    return this.allRoles.includes(normalized as any) ? normalized : null;
  }

  isValidRole(role: string | null | undefined): boolean {
    return this.normalizeRole(role) !== null;
  }

  isAdmin(role: string | null | undefined): boolean {
    return this.normalizeRole(role) === this.getAdminRole();
  }

  isWorker(role: string | null | undefined): boolean {
    return this.normalizeRole(role) === this.getWorkerRole();
  }

  isClient(role: string | null | undefined): boolean {
    return this.normalizeRole(role) === this.getClientRole();
  }

  getAdminRole(): Role { return 'ADMIN'; }
  getWorkerRole(): Role { return 'WORKER'; }
  getClientRole(): Role { return 'CLIENT'; }

}
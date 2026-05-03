import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { SessionService } from '../services/session.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const session = this.sessionService.getSession();
    const requiredRoles = route.data['roles'] as string[];
    
    if (!session) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    
    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(session.role)) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    
    return true;
  }
}
import { Injectable } from "@angular/core";
import { RoleService } from "./role.service";

@Injectable({ providedIn: 'root' })
export class NavigationService {
  
  allNavItems: Array<{ label: string; icon: string; route: string; roles: string[] }> = [];

  constructor(private roleService: RoleService) {
    this.initNavItems();
  }

  private initNavItems(): void {
    this.allNavItems = [
      { label: 'Inicio', icon: 'home', route: '/home', roles: [this.roleService.getAdminRole(), this.roleService.getWorkerRole(), this.roleService.getClientRole()] },
      { label: 'Servicios', icon: 'content_cut', route: '/services', roles: [this.roleService.getWorkerRole()] },
    ];
    // ESTA ES LA VERDADERA BARRA DE NAVEGACIÓN
    // this.allNavItems = [
    //   { label: 'Inicio', icon: 'home', route: '/home', roles: [this.roleService.getAdminRole(), this.roleService.getWorkerRole(), this.roleService.getClientRole()] },
    //   { label: 'Mi Perfil', icon: 'manage_accounts', route: '/profile', roles: [this.roleService.getAdminRole(), this.roleService.getWorkerRole(), this.roleService.getClientRole()] },
    //   { label: 'Citas', icon: 'calendar_month', route: '/appointments', roles: [this.roleService.getWorkerRole(), this.roleService.getClientRole()] },
    //   { label: 'Servicios', icon: 'content_cut', route: '/services', roles: [this.roleService.getWorkerRole()] },
    //   { label: 'Clientes', icon: 'person', route: '/users', roles: [this.roleService.getWorkerRole()] },
    //   { label: 'Usuarios', icon: 'person', route: '/users', roles: [this.roleService.getAdminRole()] },
    //   { label: 'Reportes', icon: 'assessment', route: '/reports', roles: [this.roleService.getAdminRole(), this.roleService.getWorkerRole()] },
    // ];
  }

  getNavItemsForRole(role: string | null): typeof this.allNavItems {
    if (!role) return [];
    return this.allNavItems.filter(item => item.roles.includes(role));
  }
}
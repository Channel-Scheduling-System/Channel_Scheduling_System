import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../../../core/services/session.service';
import { RoleService } from '../../../../core/services/role.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomePageComponent implements OnInit {
  userName: string = '';
  userRole: string | null = null;
  welcomeMessage: string = '';
  welcomeSubmessage: string = '';

  constructor(
    private sessionService: SessionService,
    private roleService: RoleService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const session = this.sessionService.getSession();
    this.userName = session?.name ?? 'Usuario';
    this.userRole = this.sessionService.getRole();
    this.setWelcomeMessages();
  }

  get isClient(): boolean  { return this.roleService.isClient(this.userRole); }
  get isWorker(): boolean  { return this.roleService.isWorker(this.userRole); }
  get isAdmin():  boolean  { return this.roleService.isAdmin(this.userRole);  }

  goToCreateAppointment(): void {
    this.router.navigate(['/appointments/create']);
  }

  goToManageRequests(): void {
    this.router.navigate(['/appointments/manage-requests']);
  }

  goToRegisterUser(): void {
    this.router.navigate(['/users/register']);
  }

  private setWelcomeMessages(): void {
    if (this.isAdmin) {
      this.welcomeMessage   = 'Bienvenido(a)';
      this.welcomeSubmessage = 'Desde aquí puedes gestionar todo el equipo y mantener la operación de Peluquería Channel en perfectas condiciones.';
    } else if (this.isWorker) {
      this.welcomeMessage   = 'Bienvenido(a)';
      this.welcomeSubmessage = 'Revisa tus solicitudes pendientes y prepárate para dar lo mejor de ti con cada cliente hoy.';
    } else if (this.isClient) {
      this.welcomeMessage   = 'Bienvenido(a)';
      this.welcomeSubmessage = 'Es un placer tenerte de nuevo en Channel Peluqueria. Tu próxima cita está a un clic de distancia.';
    } else {
      this.welcomeMessage   = 'Bienvenido(a)';
      this.welcomeSubmessage = 'Es un placer tenerte de nuevo en Channel Peluqueria.';
    }
  }
}
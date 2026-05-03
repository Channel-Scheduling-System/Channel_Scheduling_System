import { Component, OnInit } from '@angular/core';
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
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    const session = this.sessionService.getSession();
    this.userName = session?.name ?? 'Usuario';
    this.userRole = this.sessionService.getRole();
    this.setWelcomeMessages();
  }

  private setWelcomeMessages(): void {
    if (this.roleService.isAdmin(this.userRole)) {
      this.welcomeMessage = 'Bienvenido(a)';
      this.welcomeSubmessage = 'Es un gran dia para gestionar las operaciones y elevar la experiencia.';
    } 
    else if (this.roleService.isWorker(this.userRole)) {
      this.welcomeMessage = 'Bienvenido(a)';
      this.welcomeSubmessage = 'Es un gran dia para resaltar la belleza de tus clientes y elevar la experiencia Channel.';
    } 
    else if (this.roleService.isClient(this.userRole)) {
      this.welcomeMessage = 'Bienvenido(a)';
      this.welcomeSubmessage = 'Es un placer tenerte de nuevo en Peluquería Channel. Explora nuestros servicios y agenda tu próxima cita.';
    }
    else {
      this.welcomeMessage = 'Bienvenido';
      this.welcomeSubmessage = 'Es un placer tenerte de nuevo en Peluquería Channel.';
    }
  }

}
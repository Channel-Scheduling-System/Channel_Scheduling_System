import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../services/session.service';
import { MessageService } from '../../services/message.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  userAlias = '';
  isCollapsed = false;


  constructor(
    private sessionService: SessionService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const session = this.sessionService.getSession();
    this.userAlias = session?.alias || 'Usuario';
  }

  onLogout(): void {
    this.sessionService.logout().subscribe({
      next: (data) => {
        this.handleLogoutSuccess(data);
      },
      error: (error) => {
        this.handleLogoutError(error);
      }
    });
  }

  private handleLogoutSuccess(data: any): void {
    this.messageService.showMessage(data.message, 'success');
  }

  private handleLogoutError(error: any): void {
    this.messageService.showMessage(error.message, 'error');
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

}
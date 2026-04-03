import { Component, OnInit, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../services/session.service';
import { MessageService } from '../../services/message.service';
import { NavigationService } from '../../services/navigation.service';
import { any } from 'zod';


@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  userAlias = '';
  isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true' || false;
  windowWidth = window.innerWidth;
  isReady = false;

  private readonly SIDEBAR_STATE_KEY = 'sidebar_collapsed';
  

  @HostListener('window:resize')
  onResize() {
    this.windowWidth = window.innerWidth;
  }

  constructor(
    private sessionService: SessionService,
    private messageService: MessageService,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    const session = this.sessionService.getSession();
    this.userAlias = session?.alias || 'Usuario';
    this.enableTransitions();
  }

  private enableTransitions(): void {
    requestAnimationFrame(() => this.isReady = true);
  }

  get navItems() {
    const userRole = this.sessionService.getRole();
    return this.navigationService.getNavItemsForRole(userRole);
  }
  onLogout(): void {
    this.sessionService.logout().subscribe({
      next: () => {},
      error: (error) => {
        this.handleLogoutError(error);
      }
    });
  }

  private handleLogoutError(error: any): void {
    this.messageService.showMessage(error.message, 'error');
  }

  private saveSidebarState(): void {
    localStorage.setItem(this.SIDEBAR_STATE_KEY, String(this.isCollapsed));
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.saveSidebarState();
  }

}
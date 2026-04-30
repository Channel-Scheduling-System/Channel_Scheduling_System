import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SessionService } from './core/services/session.service';
import { AdminService } from './core/services/admin.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('frontend');

  constructor(
    private sessionService: SessionService,
    private adminService: AdminService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.beginInitialTransitions();
    this.checkAdmin();
  }

  private beginInitialTransitions(): void {
    const delay = -((performance.now() / 1000) % 8);
    document.documentElement.style.setProperty('--anim-sync', `${delay}s`);
  }

  private checkAdmin(): void {
    this.adminService.checkAdminExists().subscribe({
      next: (response) => {
        if (!response.data.exists) {
          this.sessionService.setAuthReady();
          this.router.navigate(['/auth/admin-register']);
        } else {
          if (window.location.pathname.includes('/auth/admin-register')) {
            this.router.navigate(['/auth/login']);
            this.sessionService.setAuthReady();
            return;
          }
          this.initAuth();
        }
      },
      error: () => this.initAuth()
    });
  }

  private initAuth(): void {
    this.sessionService.initAuth().subscribe({
      next: () => this.sessionService.setAuthReady(),
      error: () => this.handleAuthError()
    });
  }

  private handleAuthError(): void {
    this.sessionService.setAuthReady();
    if (!window.location.pathname.includes('/auth')) {
      this.router.navigate(['/auth/login']);
    }
  }
}

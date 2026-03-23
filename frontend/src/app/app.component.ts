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
    this.adminService.checkAdminExists().subscribe({
      next: (response) => {
        if (!response.data.exists) {
          this.router.navigate(['/auth/admin-register']);
        }else {
          this.sessionService.initAuth().subscribe({
            error: () => { 
              this.router.navigate(['/auth/login']);
            }
          });
        }
      },
      error: () => {
        this.sessionService.initAuth().subscribe({
          error: () => {
            this.router.navigate(['/auth/login']);
           }
        });
      }
    });
  }
}

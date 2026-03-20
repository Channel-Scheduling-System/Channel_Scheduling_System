import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './features/auth/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit { 
  protected readonly title = signal('frontend');

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.initAuth().subscribe({
      next: () => {
        console.log('✅ Sesión restaurada automáticamente');
      },
      error: () => {
        console.log('ℹ️ No hay sesión activa');
      }
    });
  }
}

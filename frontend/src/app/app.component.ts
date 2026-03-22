import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionService } from './core/services/session.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit { 
  protected readonly title = signal('frontend');

  constructor(
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.sessionService.initAuth().subscribe({
      error: () => {}
    });
  }
}

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IScrollService } from '../interfaces/scroll-service.interface';

@Injectable({ providedIn: 'root' })
export class ScrollService implements IScrollService{
  private scrollToTopSource = new Subject<void>();
  scrollToTop$ = this.scrollToTopSource.asObservable();

  requestScrollToTop(): void {
    this.scrollToTopSource.next();
  }
}
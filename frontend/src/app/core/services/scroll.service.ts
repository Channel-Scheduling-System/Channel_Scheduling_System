import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IScrollService } from '../interfaces/scroll-service.interface';

@Injectable({ providedIn: 'root' })
export class ScrollService implements IScrollService{
  private scrollToTopSource = new Subject<void>();
  scrollToTop$ = this.scrollToTopSource.asObservable();
  private savedPosition = 0;


  requestScrollToTop(): void {
    this.scrollToTopSource.next();
  }

  savePosition(): void {
    this.savedPosition = document.querySelector('.layout-main')?.scrollTop ?? 0;
  }

  restorePosition(): void {
    if (this.savedPosition > 0) {
      setTimeout(() => {
        document.querySelector('.layout-main')?.scrollTo({ top: this.savedPosition, behavior: 'instant' });
        this.savedPosition = 0;
      }, 0);
    }
  }

}
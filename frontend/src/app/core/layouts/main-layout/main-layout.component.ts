import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { SessionService } from '../../services/session.service';
import { MessageService } from '../../services/message.service';
import { NavigationService } from '../../services/navigation.service';
import { ScrollService } from '../../services/scroll.service';
import { FabService } from '../../services/fab.services';
import { PortalModule } from '@angular/cdk/portal';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, PortalModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  @ViewChild('mainContent') mainContent!: ElementRef<HTMLElement>;

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
    private navigationService: NavigationService,
    private router: Router,
    private scrollService: ScrollService,
    protected fabService: FabService
  ) { }

  ngOnInit(): void {
    this.initializeUserAlias();
    this.enableTransitions();
    this.setupNavigationScroll();
    this.setupScrollServiceSubscription();
  }

  private initializeUserAlias(): void {
    const session = this.sessionService.getSession();
    this.userAlias = session?.alias || 'Usuario';
  }

  private setupNavigationScroll(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.scrollToTop();
    });
  }

  private setupScrollServiceSubscription(): void {
    this.scrollService.scrollToTop$.subscribe(() => {
      this.scrollToTop();
    });
  }

  private scrollToTop(): void {
    this.mainContent?.nativeElement?.scrollTo({ top: 0, behavior: 'instant' });
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
      next: () => { },
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
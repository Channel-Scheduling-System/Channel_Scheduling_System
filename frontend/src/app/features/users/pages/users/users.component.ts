import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../services/user.service';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { ListUserItem, ListUsersResponse, Meta } from '../../models/responses/list-users-response.model';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FabService } from '../../../../core/services/fab.services';
import { TemplatePortal } from '@angular/cdk/portal';
import { SessionService } from '../../../../core/services/session.service';
import { take } from 'rxjs/internal/operators/take';
import { ScrollService } from '../../../../core/services/scroll.service';
import { ROLE_OPTIONS, STATE_OPTIONS } from '../../constants/user-filter-options.constants';
import { ErrorResponse } from '../../../../shared/models/api/error-response.schema';
import { PaginationComponent } from '../../../../core/components/pagination/pagination.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, PaginationComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersPageComponent implements OnInit, OnDestroy {

  @ViewChild('fabTemplate') private fabTemplate!: TemplateRef<any>;

  protected users: ListUserItem[] = [];
  protected meta: Meta = { total: 0, limit: 10, page: 1, totalPages: 1 };
  protected currentPage = 1;
  protected searchTerm = '';
  protected selectedRole: string | undefined = undefined;
  protected selectedState: boolean | undefined = true;

  protected isLoading = false;
  protected roleDropdownOpen = false;
  protected stateDropdownOpen = false;

  protected readonly roleOptions  = ROLE_OPTIONS;
  protected readonly stateOptions = STATE_OPTIONS;

  private scrollToTopAfterLoad = false;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private fabService: FabService,
    private viewContainerRef: ViewContainerRef,
    private sessionService: SessionService,
    private scrollService: ScrollService
  ) {}

  public ngOnInit(): void {
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      if (params['userCreated'] === 'true') {
        this.initParamsUserCreated();
      } else {
        this.resetFilters(params);
      }
      this.loadUsers();
    });
  }

  private initParamsUserCreated(): void {
    this.currentPage   = 1;
    this.selectedState = true;
    this.selectedRole  = undefined;
    this.searchTerm    = '';
    this.scrollToTopAfterLoad = true;
  }

  private resetFilters(params: Params): void {
    this.currentPage   = params['page']  ? +params['page'] : 1;
    this.searchTerm    = params['search'] ?? '';
    this.selectedRole  = params['role']  ?? undefined;
    this.selectedState = params['state'] === 'all'
  ? undefined
  : params['state'] !== undefined
    ? params['state'] === 'true'
    : true;
  }

  public ngAfterViewInit(): void {
    this.fabService.set(new TemplatePortal(this.fabTemplate, this.viewContainerRef));
  }

  public ngOnDestroy(): void {
    this.fabService.clear();
  }

  @HostListener('document:click')
  public onDocumentClick(): void {
    this.roleDropdownOpen  = false;
    this.stateDropdownOpen = false;
  }

  protected get isAdmin(): boolean {
    return this.sessionService.getRole() === 'ADMIN';
  }

  protected get selectedRoleLabel(): string {
    return this.roleOptions.find(o => o.value === this.selectedRole)?.label ?? 'Todos los roles';
  }

  protected get selectedStateLabel(): string {
    return this.stateOptions.find(o => o.value === this.selectedState)?.label ?? 'Activos';
  }

  protected get displayedCount(): number {
    return this.users.length;
  }

  private loadUsers(): void {
    this.isLoading = true;
    this.syncQueryParams();

    this.userService.getUsers({
      page:       this.currentPage,
      identifier: this.searchTerm  || undefined,
      role:       this.selectedRole || undefined,
      isActive:   this.selectedState,
    }).subscribe({
      next:  response => this.handleUsersSuccess(response),
      error: error    => this.handleUsersError(error),
    });
  }

  private syncQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page:   this.currentPage > 1        ? this.currentPage   : null,
        search: this.searchTerm?.trim()     ? this.searchTerm.trim()    : null,
        role:   this.selectedRole === undefined ? null : this.selectedRole,
        state: this.selectedState === undefined ? 'all' : String(this.selectedState),
        userCreated: null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private handleUsersSuccess(response: ListUsersResponse): void {
    this.users = response.data;
    this.meta  = response.meta;
    this.isLoading = false;
    if (this.scrollToTopAfterLoad) {
      this.scrollToTopAfterLoad = false;
      this.scrollService.requestScrollToTop();
    } else {
      this.scrollService.restorePosition();
    }
  }

  private handleUsersError(error: ErrorResponse): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }

  protected getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      ADMIN: 'Administrador', WORKER: 'Trabajador', CLIENT: 'Cliente'
    };
    return labels[role] ?? role;
  }

  protected toggleRoleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.stateDropdownOpen = false;
    this.roleDropdownOpen  = !this.roleDropdownOpen;
  }

  protected toggleStateDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.roleDropdownOpen  = false;
    this.stateDropdownOpen = !this.stateDropdownOpen;
  }

  protected selectRole(value: string | undefined, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedRole     = value;
    this.roleDropdownOpen = false;
    this.currentPage      = 1;
    this.loadUsers();
  }

  protected selectState(value: boolean | undefined, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedState     = value;
    this.stateDropdownOpen = false;
    this.currentPage       = 1;
    this.loadUsers();
  }

  protected triggerSearch(value: string): void {
    this.searchTerm  = value;
    this.currentPage = 1;
    this.loadUsers();
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.meta.totalPages) return;
    this.currentPage = page;
    this.loadUsers();
  }

  protected createUser(): void {
    this.scrollService.savePosition();
    this.router.navigate(['register'], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve'
    });
  }

  protected editUser(user: ListUserItem): void {
    this.scrollService.savePosition();
    this.router.navigate([user.id, 'edit'], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve'
    });
  }

}
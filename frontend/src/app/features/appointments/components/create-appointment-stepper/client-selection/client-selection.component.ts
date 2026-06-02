import {
  Component,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from '../../../../users/services/user.service';
import { MessageService } from '../../../../../core/services/message.service';
import { AlertType } from '../../../../../core/utils/enums/AlertType';
import { AppointmentCreateService } from '../../../services/appointment-create.service';
import { PaginationComponent } from '../../../../../core/components/pagination/pagination.component';
import { ListUserItem } from '../../../../users/models/responses/list-users-response.model';
import { ListUsersResponse } from '../../../../users/models/responses/list-users-response.model';
import { ErrorResponse } from '../../../../../shared/models/api/error-response.schema';
import { Meta } from '../../../../../shared/models/entities/entity-base.schema';
@Component({
  selector: 'app-client-selection',
  standalone: true,
  imports: [CommonModule, PaginationComponent, MatProgressSpinnerModule],
  templateUrl: './client-selection.component.html',
  styleUrl: './client-selection.component.scss',
})
export class ClientSelectionComponent implements OnInit, OnDestroy {
  private readonly userService    = inject(UserService);
  private readonly messageService = inject(MessageService);
  public  readonly wizard         = inject(AppointmentCreateService);
  private readonly destroy$ = new Subject<void>();
  protected clients:       ListUserItem[] = [];
  protected clientsMeta:   Meta = { total: 0, limit: 10, page: 1, totalPages: 1 };
  protected clientsLoading               = false;
  private   clientsPage                  = 1;
  private   clientSearchTerm             = '';
  protected searchTerm  = '';
  protected currentPage = 1;
  protected get selectedClient(): ListUserItem | null {
    return this.wizard.selectedWorkerForAppointment();
  }
  protected get canGoNext(): boolean {
    return this.wizard.canGoNext();
  }
  public ngOnInit(): void {
    this.loadClients();
  }
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private loadClients(): void {
    this.clientsLoading = true;
    this.userService.getUsers({
      page:       this.clientsPage,
      role:       'CLIENT',
      isActive:   true,
      identifier: this.clientSearchTerm || undefined,
    }).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next:  r => this.handleClientsSuccess(r),
      error: e => this.handleClientsError(e),
    });
  }
  private handleClientsSuccess(r: ListUsersResponse): void {
    this.clients        = r.data;
    this.clientsMeta    = r.meta;
    this.clientsLoading = false;
  }
  private handleClientsError(e: ErrorResponse): void {
    this.clientsLoading = false;
    this.messageService.showMessage(e.message, AlertType.ERROR);
  }
  protected triggerSearch(value: string): void {
    this.searchTerm       = value;
    this.clientSearchTerm = value;
    this.currentPage      = 1;
    this.clientsPage      = 1;
    this.loadClients();
  }
  protected onSelectClient(client: ListUserItem): void {
    this.wizard.setSelectedWorkerForAppointment(client);
  }
  protected onRemoveClient(): void {
    this.wizard.setSelectedWorkerForAppointment(null);
  }
  protected goToPage(page: number): void {
    if (page < 1 || page > this.clientsMeta.totalPages) return;
    this.currentPage = page;
    this.clientsPage = page;
    this.loadClients();
  }
  public onNext(): void {
    if (this.canGoNext) this.wizard.nextStep();
  }
  protected clientInitials(c: ListUserItem): string {
    return `${c.firstName[0] ?? ''}${c.lastName[0] ?? ''}`.toUpperCase();
  }
}
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, EMPTY } from 'rxjs';
import { switchMap, takeUntil, tap, catchError, finalize } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentsService } from '../../services/appointments.service';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { AppointmentHistoryItem } from '../../models/responses/appointments-list-response.model';
import { Meta } from '../../../../shared/models/entities/entity-base.schema';
import { PaginationComponent } from '../../../../core/components/pagination/pagination.component';
import { FormHeaderComponent } from '../../../../core/components/form-header/form-header.component';
@Component({
  selector: 'app-manage-appointment-requests',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule, PaginationComponent, FormHeaderComponent],
  templateUrl: './manage-appointment-requests.component.html',
  styleUrl: './manage-appointment-requests.component.scss',
})
export class ManageAppointmentRequestsPageComponent implements OnInit, OnDestroy {
  protected appointments: AppointmentHistoryItem[] = [];
  protected meta: Meta = { total: 0, limit: 10, page: 1, totalPages: 1 };
  protected isLoading = false;
  protected approvingId: number | null = null;
  protected rejectingId: number | null = null;
  private currentPage = 1;
  private pageChange$ = new Subject<number>();
  private destroy$    = new Subject<void>();
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly messageService      = inject(MessageService);
  private readonly router              = inject(Router);
  private readonly route               = inject(ActivatedRoute);
  public ngOnInit(): void {
    this.pageChange$
      .pipe(
        tap(() => { this.isLoading = true; }),
        switchMap(page => this.loadPendingAppointments(page)),
        takeUntil(this.destroy$),
      )
      .subscribe();
    this.pageChange$.next(this.currentPage);
  }
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  protected goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
  protected onPageChange(page: number): void {
    this.currentPage = page;
    this.pageChange$.next(page);
  }
  protected onApprove(appointmentId: number): void {
    if (this.approvingId !== null || this.rejectingId !== null) return;
    this.approvingId = appointmentId;
    this.appointmentsService.approveAppointment(appointmentId)
      .pipe(
        finalize(() => { this.approvingId = null; }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response) => {
          this.messageService.showMessage(response.message, AlertType.SUCCESS);
          this.pageChange$.next(this.currentPage);
        },
        error: (error) => {
          this.messageService.showMessage(error.message ?? 'Error al aprobar la cita.', AlertType.ERROR);
        },
      });
  }
  protected onReject(appointmentId: number): void {
    if (this.approvingId !== null || this.rejectingId !== null) return;
    this.rejectingId = appointmentId;
    this.appointmentsService.rejectAppointment(appointmentId)
      .pipe(
        finalize(() => { this.rejectingId = null; }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response) => {
          this.messageService.showMessage(response.message, AlertType.SUCCESS);
          this.pageChange$.next(this.currentPage);
        },
        error: (error) => {
          this.messageService.showMessage(error.message ?? 'Error al rechazar la cita.', AlertType.ERROR);
        },
      });
  }
  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr.replace(/Z$|[+-]\d{2}:\d{2}$/, ''));
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  protected formatTime(dateStr: string): string {
    const date = new Date(dateStr.replace(/Z$|[+-]\d{2}:\d{2}$/, ''));
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  protected formatDuration(startStr: string, endStr: string): string {
    const start = new Date(startStr);
    const end   = new Date(endStr);
    const mins  = Math.round((end.getTime() - start.getTime()) / 60000);
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h} h` : `${h} h ${m} min`;
  }
  protected totalServices(appointment: AppointmentHistoryItem): number {
    return appointment.services.reduce((acc, s) => acc + ((s as any).price ?? 0), 0);
  }
  protected isApproving(id: number): boolean {
    return this.approvingId === id;
  }
  protected isRejecting(id: number): boolean {
    return this.rejectingId === id;
  }
  protected isActionDisabled(id: number): boolean {
    return this.approvingId !== null || this.rejectingId !== null;
  }
  private loadPendingAppointments(page: number) {
    return this.appointmentsService
      .getAppointmentsBy({ status: ['PENDING'] as any, page })
      .pipe(
        tap(response => {
          this.appointments = response.data;
          this.meta         = response.meta;
          this.isLoading    = false;
        }),
        catchError(_err => {
          this.isLoading = false;
          this.messageService.showMessage(
            'No se pudieron cargar las solicitudes. Intenta nuevamente.',
            AlertType.ERROR,
          );
          return EMPTY;
        }),
      );
  }
}
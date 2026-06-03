import {
  AfterViewInit,
  Component,
  ComponentRef,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EMPTY, Subject } from 'rxjs';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { ActivatedRoute, Router } from '@angular/router';

import { FabService } from '../../../../core/services/fab.services';
import { MessageService } from '../../../../core/services/message.service';
import { SessionService } from '../../../../core/services/session.service';
import { AppointmentsService } from '../../services/appointments.service';
import { AppointmentCalendarComponent } from '../../components/appointment-calendar/appointment-calendar.component';
import { AppointmentCalendarItem } from '../../components/appointment-calendar/appointment-calendar-layer/week-layer/appointment-calendar-week-layer.component';
import {
  ConfirmationModalComponent,
  CONFIRMATION_MODAL_DATA,
} from '../../components/confirmation-modal/confirmation-modal.component';
import { ErrorResponse } from '../../../../shared/models/api/error-response.schema';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, AppointmentCalendarComponent],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss',
})
export class AppointmentsPageComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('fabTemplate') fabTemplate!: TemplateRef<any>;

  protected appointments: AppointmentCalendarItem[] = [];
  protected sessionService = inject(SessionService);
  protected currentWeekStart: Date = this.getMonday(new Date());
  protected pendingCount: number = 0;

  private readonly weekChange$ = new Subject<Date>();
  private readonly destroy$    = new Subject<void>();

  private readonly overlay  = inject(Overlay);
  private readonly injector = inject(Injector);

  private confirmOverlayRef: OverlayRef | null = null;
  private confirmModalRef:   ComponentRef<ConfirmationModalComponent> | null = null;

  constructor(
    private readonly fabService:          FabService,
    private readonly viewContainerRef:    ViewContainerRef,
    private readonly appointmentsService: AppointmentsService,
    private readonly router:              Router,
    private readonly route:               ActivatedRoute,
    private readonly messageService:      MessageService,
  ) {}


  public ngOnInit(): void {
    this.weekChange$
      .pipe(
        switchMap(weekStart => this.loadAppointments(weekStart)),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.weekChange$.next(this.currentWeekStart);

    if (this.sessionService.getRole() === 'WORKER') {
      this.loadPendingCount();
    }
  }

  public ngAfterViewInit(): void {
    this.fabService.set(new TemplatePortal(this.fabTemplate, this.viewContainerRef));
  }

  public ngOnDestroy(): void {
    this.fabService.clear();
    this.closeConfirmOverlay();
    this.destroy$.next();
    this.destroy$.complete();
  }


  protected onWeekChange(weekStart: Date): void {
    this.currentWeekStart = weekStart;
    this.weekChange$.next(weekStart);
  }

  protected onRescheduleAppointment(appointment: AppointmentCalendarItem): void {
    // TODO: navigate to reschedule flow for this appointment (CLIENT role)
    console.log('Reagendar cita:', appointment);
  }

  protected onModifyAppointment(appointment: AppointmentCalendarItem): void {
    // TODO: open modify appointment form (WORKER role)
    console.log('Modificar cita:', appointment);
  }

  protected onCancelAppointment(appointment: AppointmentCalendarItem): void {
    this.closeConfirmOverlay();

    this.confirmOverlayRef = this.createFullScreenOverlay();
    const portal           = this.buildConfirmationPortal();
    this.confirmModalRef   = this.confirmOverlayRef.attach(portal);
    this.confirmModalRef.changeDetectorRef.detectChanges();

    this.confirmModalRef.instance.confirmed.subscribe(() => {
      this.closeConfirmOverlay();
      this.executeCancelAppointment(appointment);
    });

    this.confirmModalRef.instance.cancelled.subscribe(() => {
      this.closeConfirmOverlay();
    });
  }


  protected goToRequests(): void {
    this.router.navigate(['manage-requests'], { relativeTo: this.route });
  }

  protected goToHistory(): void {
    // TODO: navigate to appointment history page
  }

  protected scheduleAppointment(): void {
    this.router.navigate(['create'], { relativeTo: this.route });
  }


  private loadPendingCount(): void {
    this.appointmentsService
      .getQuantityStatusAppointments({ status: ['PENDING'] })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  (res) => { this.pendingCount = res.quantity; },
        error: ()    => { this.pendingCount = 0; },
      });
  }

  private createFullScreenOverlay(): OverlayRef {
    const ref = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy:   this.overlay.scrollStrategies.reposition(),
      hasBackdrop:      true,
      backdropClass:    'cdk-overlay-transparent-backdrop',
    });
    ref.backdropClick().subscribe(() => this.closeConfirmOverlay());
    return ref;
  }

  private buildConfirmationPortal(): ComponentPortal<ConfirmationModalComponent> {
    const childInjector = Injector.create({
      providers: [{
        provide:  CONFIRMATION_MODAL_DATA,
        useValue: {
          title:   '¿Cancelar cita?',
          message: 'Esta acción no se puede deshacer. ¿Estás seguro de que deseas cancelar esta cita?',
        },
      }],
      parent: this.injector,
    });
    return new ComponentPortal(ConfirmationModalComponent, null, childInjector);
  }

  private closeConfirmOverlay(): void {
    this.confirmOverlayRef?.dispose();
    this.confirmOverlayRef = null;
    this.confirmModalRef   = null;
  }

  private executeCancelAppointment(appointment: AppointmentCalendarItem): void {
    this.appointmentsService
      .cancelAppointment(appointment.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.messageService.showMessage(response.message, 'success');
          this.weekChange$.next(this.currentWeekStart);
        },
        error: () => {
          this.messageService.showMessage(
            'No se pudo cancelar la cita. Inténtalo de nuevo.',
            'error',
          );
        },
      });
  }

  private loadAppointments(weekStart: Date) {
    return this.appointmentsService
      .getActiveAppointments({
        view: 'WEEK',
        date: this.formatDateParam(weekStart),
      })
      .pipe(
        tap(response => { this.appointments = response.data as AppointmentCalendarItem[]; }),
        catchError(error => {
          this.handleFetchError(error);
          return EMPTY;
        }),
      );
  }

  private handleFetchError(error: ErrorResponse): void {
    this.messageService.showMessage(
      error.message,
      'error',
    );
  }

  private getMonday(date: Date): Date {
    const d   = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private formatDateParam(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, EMPTY } from 'rxjs';
import { switchMap, takeUntil, tap, catchError } from 'rxjs/operators';
import { TemplatePortal } from '@angular/cdk/portal';
import { FabService } from '../../../../core/services/fab.services';
import { AppointmentCalendarComponent } from '../../components/appointment-calendar/appointment-calendar.component';
import { AppointmentsService } from '../../services/appointments.service';
import { AppointmentCalendarItem } from '../../components/appointment-calendar/appointment-calendar-layer/week-layer/appointment-calendar-week-layer.component';
import { MessageService } from '../../../../core/services/message.service';
import { ActivatedRoute, Router } from '@angular/router';

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

  protected currentWeekStart: Date = this.getMonday(new Date());

  private weekChange$ = new Subject<Date>();
  private destroy$    = new Subject<void>();

  constructor(
    private fabService:          FabService,
    private viewContainerRef:    ViewContainerRef,
    private appointmentsService: AppointmentsService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService:      MessageService,
  ) {}

  public ngOnInit(): void {
    this.weekChange$
      .pipe(
        switchMap(weekStart => this.loadAppointments(weekStart)),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.weekChange$.next(this.currentWeekStart);
  }

  public ngAfterViewInit(): void {
    this.fabService.set(new TemplatePortal(this.fabTemplate, this.viewContainerRef));
  }

  public ngOnDestroy(): void {
    this.fabService.clear();
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onWeekChange(weekStart: Date): void {
    this.currentWeekStart = weekStart;
    this.weekChange$.next(weekStart);
  }

  protected goToRequests(): void {
    // TODO: navigate to requests/scheduled appointments page
  }

  protected goToHistory(): void {
    // TODO: navigate to appointment history page
  }

  protected scheduleAppointment(): void {
    this.router.navigate(['create'], {
      relativeTo: this.route
    });
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
    // TODO: confirm and cancel appointment (all roles)
    console.log('Cancelar cita:', appointment);
  }

  private loadAppointments(weekStart: Date) {
    return this.appointmentsService
      .getActiveAppointments({
        view: 'WEEK',
        date: this.formatDateParam(weekStart),
      })
      .pipe(
        tap(response => { this.appointments = response.data as AppointmentCalendarItem[]; }),
        catchError(_err => {
          this.handleFetchError();
          return EMPTY;
        }),
      );
  }

  private handleFetchError(): void {
    /*this.messageService.add({
      severity: 'error',
      summary:  'Error al cargar citas',
      detail:   'No se pudieron obtener las citas activas. Intente nuevamente.',
      life:     5000,
    });*/
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
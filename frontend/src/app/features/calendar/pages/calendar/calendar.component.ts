import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  getDay,
  isSameDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { AvailabilityService } from '../../services/availability.service';
import type {
  AvailabilityConfigData,
  AvailabilityConfigResponse,
  WorkingHour,
} from '../../models/responses/availability-response.model';
import type { CalendarView } from '../../types/calendar-view.types';
import { SessionService } from '../../../../core/services/session.service';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import type { ErrorResponse } from '../../../../shared/models/api/error-response.schema';
import { buildTimeSlots, buildVisibleDays } from '../../utils/time-slots.util';
import { CalendarCellService } from '../../services/calendar-cell.service';
import { CalendarGridDayComponent } from '../../components/calendar-grid/day/calendar-grid-day.component';
import { CalendarGridWeekComponent } from '../../components/calendar-grid/week/calendar-grid-week.component';
import { CalendarGridMonthComponent } from '../../components/calendar-grid/month/calendar-grid-month.component';
import { CalendarSidebarComponent } from '../../components/calendar-sidebar/calendar-sidebar.component';
import type { TimeSlot } from '../../interfaces/time-slot.interface';
import { CalendarTooltipService } from '../../ui/calendar-tooltip.service';
import { CalendarTooltipComponent } from '../../components/calendar-tooltip/calendar-tooltip.component';
import { CalendarSelectionMenuService } from '../../ui/calendar-selection-menu.service';
import { CalendarOptionsMenuComponent } from '../../components/calendar-options-menu/calendar-options-menu.component';
import { CalendarScrollHintComponent } from '../../components/calendar-scroll-hint/calendar-scroll-hint.component';
import { CalendarFooterComponent } from '../../components/calendar-footer/calendar-footer.component';
import { AvailabilityHierarchyAdapter } from '../../adapters/availability-hierachy.adapter';
import { formatTimeTo12Hour } from '../../utils/time.util';
import { Overlay } from '@angular/cdk/overlay';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WorkingHoursModalComponent, WorkingHoursModalData } from '../../components/working-hours/working-hours-modal.component';
import { UpdateWorkingHoursRequest } from '../../models/requests/update-working-hours-request.model';
import { UpdateWorkingHoursResponse } from '../../models/responses/update-working-hours-response.model';
import { DAY_INDEX_TO_WEEKDAY } from '../../constants/availability.constants';
import { TimeOffModalComponent, TimeOffModalData } from '../../components/time-off/time-off-modal.component';
import { SetTimeOffRequest } from '../../models/requests/set-time-off-request.model';
import { SetTimeOffResponse } from '../../models/responses/set-time-off-response.model';
import { DayOffModalComponent, DayOffModalData } from '../../components/day-off/day-off-modal.component';
import { SetDayOffResponse } from '../../models/responses/set-day-off-response.model';
import { SetDayOffRequest } from '../../models/requests/set-day-off-request.model';
import { PeriodOffModalComponent, PeriodOffModalData } from '../../components/period-off/period-off-modal.component';
import { SetPeriodOffResponse } from '../../models/responses/set-period-off-response.model';
import { SetPeriodOffRequest } from '../../models/requests/set-period-off-request.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    CalendarGridDayComponent,
    CalendarGridWeekComponent,
    CalendarGridMonthComponent,
    CalendarSidebarComponent,
    CalendarFooterComponent,
    CalendarTooltipComponent,
    CalendarOptionsMenuComponent,
    CalendarScrollHintComponent,
  ],
  providers: [CalendarCellService, AvailabilityHierarchyAdapter],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarPageComponent implements OnInit, AfterViewInit {
  protected currentView: CalendarView = 'week';
  protected currentDate: Date = new Date();
  protected isDeleteMode = false;
  protected isLoading = false;

  protected timeSlots: TimeSlot[] = [];
  protected visibleDays: Date[] = [];
  protected weekDayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  protected availabilityData: AvailabilityConfigData | null = null;


  protected headerH = 60;

  private readonly tooltipSvc = inject(CalendarTooltipService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly selectionMenuSvc = inject(CalendarSelectionMenuService);
  private readonly dialog = inject(MatDialog);
  private readonly overlay = inject(Overlay);
  private allWorkingHours: WorkingHour[] = [];

  @ViewChild('gridWrap') private gridWrap!: ElementRef<HTMLElement>;
  @ViewChild(CalendarGridWeekComponent) private weekGridComp?: CalendarGridWeekComponent;
  @ViewChild(CalendarGridDayComponent) private dayGridComp?: CalendarGridDayComponent;


  protected get activeGridEl(): HTMLElement | null {
    return this.gridWrap?.nativeElement ?? null;



  }

  protected get scrollGridContainer(): HTMLElement | null {
    return this.gridWrap?.nativeElement ?? null;
  }

  public constructor(
    private availabilityService: AvailabilityService,
    private sessionService: SessionService,
    private messageService: MessageService,
    private calendarCellService: CalendarCellService,
  ) { }

  public ngOnInit(): void {
    this.timeSlots = buildTimeSlots();
    this.visibleDays = buildVisibleDays(this.currentDate, this.currentView);
    this.loadAvailabilityConfig();
  }

  public ngAfterViewInit(): void {
    this.cdr.detectChanges();
    this.scrollToCurrentTime();

    setTimeout(() => this._updateHeaderH());
  }



  protected goToPrev(): void {
    if (this.currentView === 'day') this.currentDate = addDays(this.currentDate, -1);
    else if (this.currentView === 'week') this.currentDate = subWeeks(this.currentDate, 1);
    else this.currentDate = subMonths(this.currentDate, 1);
    this.visibleDays = buildVisibleDays(this.currentDate, this.currentView);
    this.scrollToCurrentTime();
    this.loadAvailabilityConfig();
  }

  protected goToNext(): void {
    if (this.currentView === 'day') this.currentDate = addDays(this.currentDate, 1);
    else if (this.currentView === 'week') this.currentDate = addWeeks(this.currentDate, 1);
    else this.currentDate = addMonths(this.currentDate, 1);
    this.visibleDays = buildVisibleDays(this.currentDate, this.currentView);
    this.scrollToCurrentTime();
    this.loadAvailabilityConfig();
  }

  protected goToToday(): void {
    this.currentDate = new Date();
    this.visibleDays = buildVisibleDays(this.currentDate, this.currentView);
    this.scrollToCurrentTime();
    this.loadAvailabilityConfig();
  }

  protected setView(view: CalendarView): void {
    this.currentView = view;
    this.visibleDays = buildVisibleDays(this.currentDate, this.currentView);
    this.scrollToCurrentTime();
    this.loadAvailabilityConfig();

    setTimeout(() => this._updateHeaderH());
  }



  private loadAvailabilityConfig(): void {
    const workerId = this.sessionService.getSession()?.id;
    if (!workerId) {
      this.messageService.showMessage(
        'No se pudo obtener la información del trabajador',
        AlertType.ERROR,
      );
      return;
    }
    this.isLoading = true;

    const view = this.currentView.toUpperCase() as 'DAY' | 'WEEK' | 'MONTH';
    let date: string;
    if (this.currentView === 'week') {
      date = format(startOfWeek(this.currentDate, { locale: es }), 'yyyy-MM-dd');
    } else if (this.currentView === 'month') {
      date = format(startOfMonth(this.currentDate), 'yyyy-MM-dd');
    } else {
      date = format(this.currentDate, 'yyyy-MM-dd');
    }

    this.availabilityService
      .getAvailabilityConfig(workerId, {
        include: ['workingHours', 'daysOff', 'timesOff', 'periodsOff'],
        view,
        date,
      })
      .subscribe({
        next: (r) => this.handleAvailabilitySuccess(r),
        error: (e: ErrorResponse) => this.handleAvailabilityError(e),
      });
  }

  private handleAvailabilitySuccess(response: AvailabilityConfigResponse): void {
    this.isLoading = false;
    this.availabilityData = response.data;

    const incoming = response.data.workingHours ?? [];
    if (incoming.length > 0) {
      const merged = new Map<string, WorkingHour>(
        this.allWorkingHours.map(wh => [wh.dayOfWeek, wh]),
      );
      for (const wh of incoming) {
        merged.set(wh.dayOfWeek, wh);
      }
      this.allWorkingHours = [...merged.values()];
    }
    this.calendarCellService.configure(this.availabilityData, this.timeSlots);
  }

  private handleAvailabilityError(error: ErrorResponse): void {
    this.isLoading = false;
    this.messageService.showMessage(
      error.message ?? 'Error al cargar la agenda',
      AlertType.ERROR,
    );
  }

  protected get dateRangeLabel(): string {
    if (this.currentView === 'day') {
      return format(this.currentDate, "d 'de' MMMM yyyy", { locale: es });
    }
    if (this.currentView === 'week') {
      const start = startOfWeek(this.currentDate, { locale: es });
      const end = endOfWeek(this.currentDate, { locale: es });
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, 'd', { locale: es })} – ${format(end, 'd MMM yyyy', { locale: es })}`;
      }
      return `${format(start, 'd MMM', { locale: es })} – ${format(end, 'd MMM yyyy', { locale: es })}`;
    }
    return format(this.currentDate, 'MMMM yyyy', { locale: es });
  }

  private _updateHeaderH(): void {
    const header = this.gridWrap?.nativeElement
      ?.querySelector<HTMLElement>('.cal-grid__day-header');
    if (header) {
      this.headerH = header.offsetHeight;
    }
  }

  private scrollToCurrentTime(): void {
    setTimeout(() => {
      const el = this.gridWrap?.nativeElement;
      if (!el) return;

      if (this.currentView === 'month') {
        const todayCell = el.querySelector('.cal-month__day--today') as HTMLElement;
        if (todayCell) {
          const offset =
            todayCell.offsetTop - el.clientHeight / 2 + todayCell.offsetHeight / 2;
          el.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
        }
        return;
      }

      const now = new Date();
      const startHour = 5;
      const firstLabel = el.querySelector('.cal-grid__time-label') as HTMLElement;
      const slotHeight = firstLabel ? firstLabel.offsetHeight : 48;
      const slotsFromStart =
        (now.getHours() - startHour) * 2 + (now.getMinutes() >= 30 ? 1 : 0);
      el.scrollTo({
        top: Math.max(0, slotsFromStart * slotHeight - slotHeight * 2),
        behavior: 'smooth',
      });
    }, 100);
  }



  protected onGridScroll(): void {
    this.tooltipSvc.hide();
  }

  protected onSelectionComplete(
    selection: { day: Date; startSlot: TimeSlot; endSlot: TimeSlot; x: number; y: number },
  ): void {
    const startStr = `${selection.startSlot.hour.toString().padStart(2, '0')}:${selection.startSlot.minute.toString().padStart(2, '0')}`;

    const endTotalMin = selection.endSlot.hour * 60 + selection.endSlot.minute + 30;
    const endH = Math.floor(endTotalMin / 60);
    const endM = endTotalMin % 60;
    const endStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

    const start12h = formatTimeTo12Hour(startStr);
    const end12h = formatTimeTo12Hour(endStr);

    const label = `${start12h} — ${end12h}`;

    this.selectionMenuSvc.show(selection.x, selection.y, 'edit_calendar', label, [
      {
        icon: 'lock_clock',
        label: 'Definir nuevo bloqueo',
        handler: () => this.openTimeOffConfig(selection),
      },
    ]);
  }

  protected onMonthDayContextMenu(payload: { day: Date; x: number; y: number }): void {
    const label = format(payload.day, "EEEE d 'de' MMMM", { locale: es });
    this.selectionMenuSvc.show(payload.x, payload.y, 'calendar_today', label, [
      {
        icon: 'work_off',
        label: 'Definir como día fuera de la jornada',
        handler: () => this.openDayOffConfig(payload.day),
      },
    ]);
  }

  protected onWeekdayHeaderContextMenu(payload: { day: Date; x: number; y: number }): void {
    const label = format(payload.day, 'EEEE', { locale: es });
    const isWorking = this.calendarCellService.isWorkingDay(payload.day);

    this.selectionMenuSvc.show(payload.x, payload.y, 'calendar_today', label, [
      {
        icon: isWorking ? 'work_off' : 'work',
        label: isWorking
          ? 'Definir como día fuera de la jornada'
          : 'Definir como día dentro de la jornada',
        handler: () => isWorking
          ? this.removeFromWorkingDays(payload.day)
          : this.addToWorkingDays(payload.day),
      },
    ]);
  }

  private removeFromWorkingDays(day: Date): void {
    const workerId = this.sessionService.getSession()?.id;
    if (!workerId) return;

    const weekday = DAY_INDEX_TO_WEEKDAY[getDay(day)];

    const workingHours = this.allWorkingHours
      .filter(wh => wh.dayOfWeek !== weekday)
      .map(wh => ({ dayOfWeek: wh.dayOfWeek as any, startTime: wh.startTime, endTime: wh.endTime }));

    this.availabilityService.updateWorkingHours(workerId, { workingHours }).subscribe({
      next: (r) => {

        this.allWorkingHours = this.allWorkingHours.filter(wh => wh.dayOfWeek !== weekday);
        this.messageService.showMessage(r.message, AlertType.SUCCESS);
        this.loadAvailabilityConfig();
      },
      error: (e: ErrorResponse) =>
        this.messageService.showMessage(e.message ?? 'Error al actualizar la jornada', AlertType.ERROR),
    });
  }

  private addToWorkingDays(day: Date): void {
    const workerId = this.sessionService.getSession()?.id;
    if (!workerId) return;

    const weekday = DAY_INDEX_TO_WEEKDAY[getDay(day)];
    const newEntry: WorkingHour = { dayOfWeek: weekday as any, startTime: '08:00', endTime: '18:00' };


    const workingHours = [
      ...this.allWorkingHours.filter(wh => wh.dayOfWeek !== weekday),
      newEntry,
    ].map(wh => ({ dayOfWeek: wh.dayOfWeek as any, startTime: wh.startTime, endTime: wh.endTime }));

    this.availabilityService.updateWorkingHours(workerId, { workingHours }).subscribe({
      next: (r) => {
        this.allWorkingHours = [
          ...this.allWorkingHours.filter(wh => wh.dayOfWeek !== weekday),
          newEntry,
        ];
        this.messageService.showMessage(r.message, AlertType.SUCCESS);
        this.loadAvailabilityConfig();
      },
      error: (e: ErrorResponse) =>
        this.messageService.showMessage(e.message ?? 'Error al actualizar la jornada', AlertType.ERROR),
    });
  }

  protected onDayHeaderClick(payload: { day: Date; x: number; y: number }): void {
    const label = format(payload.day, "EEEE d 'de' MMMM", { locale: es });
    const isWorking = this.calendarCellService.isWorkingDay(payload.day);

    this.selectionMenuSvc.show(payload.x, payload.y, 'calendar_today', label, [
      {
        icon: isWorking ? 'work_off' : 'work',
        label: isWorking
          ? 'Definir como día fuera de la jornada'
          : 'Definir como día dentro de la jornada',
        handler: () => isWorking
          ? this.removeFromWorkingDays(payload.day)
          : this.addToWorkingDays(payload.day),
      },
      {
        icon: 'event_busy',
        label: 'Definir como día libre',
        handler: () => this.openDayOffConfig(payload.day),
      },
      {
        icon: 'date_range',
        label: 'Definir nuevo periodo de días libres',
        handler: () => this.openPeriodOffConfig(payload.day),
      },
    ]);
  }

  protected onMonthSelectionComplete(
    sel: { startDay: Date; endDay: Date; x: number; y: number },
  ): void {
    const isSingle = isSameDay(sel.startDay, sel.endDay);
    const label = isSingle
      ? format(sel.startDay, "EEEE d 'de' MMMM", { locale: es })
      : `${format(sel.startDay, 'd MMM', { locale: es })} — ${format(sel.endDay, 'd MMM yyyy', { locale: es })}`;

    const actions = isSingle
      ? [{
        icon: 'event_busy', label: 'Definir nuevo día libre',
        handler: () => this.openDayOffConfig(sel.startDay)
      }]
      : [{
        icon: 'date_range', label: 'Definir nuevo período libre',
        handler: () => this.openPeriodOffConfig(sel.startDay, sel.endDay)
      }];

    this.selectionMenuSvc.show(sel.x, sel.y, 'calendar_today', label, actions);
  }

  protected openWorkingHoursConfig(): void {
    if (!this.availabilityData) return;

    const dialogData: WorkingHoursModalData = {
      availabilityData: this.availabilityData,
      onSubmit: (request: UpdateWorkingHoursRequest) =>
        this.onWorkingHoursSubmit(request, dialogRef),
    };

    const dialogRef = this.dialog.open(WorkingHoursModalComponent, {
      width: 'auto',
      maxWidth: '90vw',
      panelClass: 'service-dialog-panel',
      backdropClass: 'service-dialog-backdrop',
      disableClose: false,
      autoFocus: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      data: dialogData,
    });
  }

  private onWorkingHoursSubmit(
    request: UpdateWorkingHoursRequest,
    dialogRef?: MatDialogRef<WorkingHoursModalComponent>,
  ): void {
    const workerId = this.sessionService.getSession()?.id;
    if (!workerId) return;

    this.availabilityService.updateWorkingHours(workerId, request).subscribe({
      next: (r) => this.handleWorkingHoursSuccess(r, dialogRef),
      error: (e: ErrorResponse) => this.handleWorkingHoursError(e, dialogRef),
    });
  }

  private handleWorkingHoursSuccess(
    response: UpdateWorkingHoursResponse,
    dialogRef?: MatDialogRef<WorkingHoursModalComponent>
  ): void {
    if (dialogRef) dialogRef.componentInstance.setSubmitting(false);
    this.messageService.showMessage(response.message, AlertType.SUCCESS);
    this.loadAvailabilityConfig();
  }

  private handleWorkingHoursError(
    error: ErrorResponse,
    dialogRef?: MatDialogRef<WorkingHoursModalComponent>,
  ): void {
    if (dialogRef) dialogRef.componentInstance.setSubmitting(false);
    this.messageService.showMessage(error.message, AlertType.ERROR);
    this.loadAvailabilityConfig();
  }
  protected openDayOffConfig(day?: Date): void {
    const dialogData: DayOffModalData = {
      day,
      onSubmit: (request: SetDayOffRequest) =>
        this.onDayOffSubmit(request, dialogRef),
    };

    const dialogRef = this.dialog.open(DayOffModalComponent, {
      width: 'auto',
      maxWidth: '90vw',
      panelClass: 'service-dialog-panel',
      backdropClass: 'service-dialog-backdrop',
      disableClose: false,
      autoFocus: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      data: dialogData,
    });
  }

  private onDayOffSubmit(
    request: SetDayOffRequest,
    dialogRef?: MatDialogRef<DayOffModalComponent>,
  ): void {
    const workerId = this.sessionService.getSession()?.id;
    if (!workerId) return;

    this.availabilityService.setDayOff(workerId, request).subscribe({
      next: (r) => this.handleDayOffSuccess(r, dialogRef),
      error: (e: ErrorResponse) => this.handleDayOffError(e, dialogRef),
    });
  }

  private handleDayOffSuccess(
    response: SetDayOffResponse,
    dialogRef?: MatDialogRef<DayOffModalComponent>,
  ): void {
    dialogRef?.componentInstance.setSubmitting(false);
    dialogRef?.close();
    this.messageService.showMessage(response.message, AlertType.SUCCESS);
    this.loadAvailabilityConfig();
  }

  private handleDayOffError(
    error: ErrorResponse,
    dialogRef?: MatDialogRef<DayOffModalComponent>,
  ): void {
    dialogRef?.componentInstance.setSubmitting(false);
    this.messageService.showMessage(
      error.message ?? 'Error al registrar el día libre',
      AlertType.ERROR,
    );
  }
  protected openTimeOffConfig(
    context?: { day: Date; startSlot?: TimeSlot; endSlot?: TimeSlot },
  ): void {
    const dialogData: TimeOffModalData = {
      day: context?.day,
      startSlot: context?.startSlot,
      endSlot: context?.endSlot,
      onSubmit: (request: SetTimeOffRequest) =>
        this.onTimeOffSubmit(request, dialogRef),
    };

    const dialogRef = this.dialog.open(TimeOffModalComponent, {
      width: 'auto',
      maxWidth: '90vw',
      panelClass: 'service-dialog-panel',
      backdropClass: 'service-dialog-backdrop',
      disableClose: false,
      autoFocus: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      data: dialogData,
    });
  }

  private onTimeOffSubmit(
    request: SetTimeOffRequest,
    dialogRef?: MatDialogRef<TimeOffModalComponent>,
  ): void {
    const workerId = this.sessionService.getSession()?.id;
    if (!workerId) return;

    this.availabilityService.setTimeOff(workerId, request).subscribe({
      next: (r) => this.handleTimeOffSuccess(r, dialogRef),
      error: (e: ErrorResponse) => this.handleTimeOffError(e, dialogRef),
    });
  }

  private handleTimeOffSuccess(
    response: SetTimeOffResponse,
    dialogRef?: MatDialogRef<TimeOffModalComponent>,
  ): void {
    dialogRef?.componentInstance.setSubmitting(false);
    dialogRef?.close();
    this.messageService.showMessage(response.message, AlertType.SUCCESS);
    this.loadAvailabilityConfig();
  }

  private handleTimeOffError(
    error: ErrorResponse,
    dialogRef?: MatDialogRef<TimeOffModalComponent>,
  ): void {
    dialogRef?.componentInstance.setSubmitting(false);
    this.messageService.showMessage(
      error.message ?? 'Error al crear el bloqueo',
      AlertType.ERROR,
    );
  }
  protected openPeriodOffConfig(startDay?: Date, endDay?: Date): void {
    const dialogData: PeriodOffModalData = {
      startDay: startDay,
      endDay: endDay,
      onSubmit: (request: SetPeriodOffRequest) =>
        this.onPeriodOffSubmit(request, dialogRef),
    };
    const dialogRef = this.dialog.open(PeriodOffModalComponent, {
      width: 'auto',
      maxWidth: '90vw',
      panelClass: 'service-dialog-panel',
      backdropClass: 'service-dialog-backdrop',
      disableClose: false,
      autoFocus: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      data: dialogData,
    });
  }

  private onPeriodOffSubmit(
    request: SetPeriodOffRequest,
    dialogRef?: MatDialogRef<PeriodOffModalComponent>,
  ): void {
    const workerId = this.sessionService.getSession()?.id;
    if (!workerId) return;
    this.availabilityService.setPeriodOff(workerId, request).subscribe({
      next: (r) => this.handlePeriodOffSuccess(r, dialogRef),
      error: (e: ErrorResponse) => this.handlePeriodOffError(e, dialogRef),
    });
  }

  private handlePeriodOffSuccess(
    response: SetPeriodOffResponse,
    dialogRef?: MatDialogRef<PeriodOffModalComponent>,
  ): void {
    dialogRef?.componentInstance.setSubmitting(false);
    dialogRef?.close();
    this.messageService.showMessage(response.message, AlertType.SUCCESS);
    this.loadAvailabilityConfig();
  }

  private handlePeriodOffError(
    error: ErrorResponse,
    dialogRef?: MatDialogRef<PeriodOffModalComponent>,
  ): void {
    dialogRef?.componentInstance.setSubmitting(false);
    this.messageService.showMessage(
      error.message ?? 'Error al registrar el período libre',
      AlertType.ERROR,
    );
  }
  protected toggleDeleteMode(): void { this.isDeleteMode = !this.isDeleteMode; }
  protected onSlotClick(day: Date, slot: TimeSlot): void { }
  protected onMonthDayClick(day: Date): void { }
  protected onMonthDayPointerDown(day: Date): void { }

  protected onBoundaryChange(
    payload: { day: Date; type: 'start' | 'end'; newSlot: TimeSlot; originalSlot: TimeSlot },
  ): void {
    if (!this.availabilityData?.workingHours?.length) return;

    const request = this.buildBoundaryRequest(payload);
    if (!request) return;

    const workerId = this.sessionService.getSession()?.id;
    if (!workerId) return;

    this.availabilityService.updateWorkingHours(workerId, request).subscribe({
      next: (r) => {
        this.messageService.showMessage(r.message, AlertType.SUCCESS);
        this.loadAvailabilityConfig();
      },
      error: (e: ErrorResponse) => {
        this.messageService.showMessage(e.message ?? 'Error al actualizar la jornada', AlertType.ERROR);
        (this.weekGridComp ?? this.dayGridComp)?.revertBoundaryChange(payload.day, payload.type);
      },
    });
  }

  private buildBoundaryRequest(
    payload: { day: Date; type: 'start' | 'end'; newSlot: TimeSlot },
  ): UpdateWorkingHoursRequest | null {
    const weekday = DAY_INDEX_TO_WEEKDAY[getDay(payload.day)];

    const newMin = payload.type === 'start'
      ? payload.newSlot.hour * 60 + payload.newSlot.minute + 30
      : payload.newSlot.hour * 60 + payload.newSlot.minute;

    const newTimeStr =
      `${String(Math.floor(newMin / 60)).padStart(2, '0')}:${String(newMin % 60).padStart(2, '0')}`;


    if (!this.allWorkingHours.some(wh => wh.dayOfWeek === weekday)) return null;


    const workingHours = this.allWorkingHours.map(wh => ({
      dayOfWeek: wh.dayOfWeek as any,
      startTime: wh.dayOfWeek === weekday && payload.type === 'start' ? newTimeStr : wh.startTime,
      endTime: wh.dayOfWeek === weekday && payload.type === 'end' ? newTimeStr : wh.endTime,
    }));

    return { workingHours };
  }
}
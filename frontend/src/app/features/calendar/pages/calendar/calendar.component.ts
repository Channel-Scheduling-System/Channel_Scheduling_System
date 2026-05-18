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


  @ViewChild('gridWrap') private gridWrap!: ElementRef<HTMLElement>;
  @ViewChild('weekGrid') private weekGrid?: ElementRef<HTMLElement>;
  @ViewChild('dayGrid') private dayGrid?: ElementRef<HTMLElement>;


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
    this.selectionMenuSvc.show(payload.x, payload.y, 'calendar_today', label, [
      {
        icon: 'work_off',
        label: 'Definir como día fuera de la jornada',
        handler: () => this.openDayOffConfig(payload.day),
      },
    ]);
  }

  protected onDayHeaderClick(payload: { day: Date; x: number; y: number }): void {
    const label = format(payload.day, "EEEE d 'de' MMMM", { locale: es });
    this.selectionMenuSvc.show(payload.x, payload.y, 'calendar_today', label, [
      {
        icon: 'work_off',
        label: 'Definir como día fuera de la jornada',
        handler: () => this.openDayOffConfig(payload.day),
      },
      {
        icon: 'event_busy',
        label: 'Definir como día libre',
        handler: () => this.openTimeOffConfig({ day: payload.day }),
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
        handler: () => this.openTimeOffConfig({ day: sel.startDay })
      }]
      : [{
        icon: 'date_range', label: 'Definir nuevo período libre',
        handler: () => this.openPeriodOffConfig(sel.startDay)
      }];

    this.selectionMenuSvc.show(sel.x, sel.y, 'calendar_today', label, actions);
  }

  protected openWorkingHoursConfig(): void { }
  protected openDayOffConfig(day?: Date): void { }
  protected openTimeOffConfig(context?: { day: Date; startSlot?: TimeSlot; endSlot?: TimeSlot }): void { }
  protected openPeriodOffConfig(day?: Date): void { }
  protected toggleDeleteMode(): void { this.isDeleteMode = !this.isDeleteMode; }
  protected onSlotClick(day: Date, slot: TimeSlot): void { }
  protected onMonthDayClick(day: Date): void { }
  protected onMonthDayPointerDown(day: Date): void { }
}
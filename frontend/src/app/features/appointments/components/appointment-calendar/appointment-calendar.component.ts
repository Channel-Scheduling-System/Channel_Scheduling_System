import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentCalendarWeekGridComponent } from './appointment-calendar-grid/week-grid/appointment-calendar-week-grid.component';
import { AppointmentCalendarItem, AppointmentCalendarWeekLayerComponent, ChipClickPayload } from './appointment-calendar-layer/week-layer/appointment-calendar-week-layer.component';
import { AppointmentActionModalComponent } from '../appointment-action-modal/appointment-action-modal.component';
import { SessionService } from '../../../../core/services/session.service';
import { AppointmentActionModalService } from '../../utils/appointments-actions-modal.service';
import { AppointmentCalendarDayLayerComponent } from './appointment-calendar-layer/day-layer/appointment-calendar-day-layer.component';
import { AppointmentCalendarDayGridComponent } from './appointment-calendar-grid/day-grid/appointment-calendar-day-grid.component';
import { ConfigView } from '../../../../shared/models/entities/date.schema';

interface ViewOption {
  key: ConfigView;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-appointment-calendar',
  standalone: true,
  imports: [
    CommonModule,
    AppointmentCalendarWeekGridComponent,
    AppointmentCalendarWeekLayerComponent,
    AppointmentCalendarDayGridComponent,
    AppointmentCalendarDayLayerComponent,
    AppointmentActionModalComponent,
  ],
  templateUrl: './appointment-calendar.component.html',
  styleUrl: './appointment-calendar.component.scss',
})
export class AppointmentCalendarComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() public appointments: AppointmentCalendarItem[] = [];
  @Output() public weekStartChange = new EventEmitter<Date>();
  @Output() public rescheduleAppointment = new EventEmitter<AppointmentCalendarItem>();
  @Output() public modifyAppointment = new EventEmitter<AppointmentCalendarItem>();
  @Output() public cancelAppointment = new EventEmitter<AppointmentCalendarItem>();

  @ViewChild(AppointmentCalendarWeekGridComponent, { read: ElementRef })
  private gridRef!: ElementRef<HTMLElement>;

  protected currentView: ConfigView = 'DAY';
  protected currentDate: Date = new Date();
  protected weekStart!: Date;
  protected weekEnd!: Date;
  protected headerHeightRem: number = 5.0;
  protected hasAutoScrolled: boolean = false;

  protected readonly availableViews: ViewOption[] = [
    { key: 'WEEK', label: 'Semana', icon: 'calendar_view_week' },
    { key: 'DAY', label: 'Día', icon: 'calendar_view_day' },
  ];

  private readonly SCROLL_SLOT_H_REM = 3;

  constructor(
    private readonly modalSvc: AppointmentActionModalService,
    private readonly sessionSvc: SessionService,
    private readonly el: ElementRef<HTMLElement>,
  ) { }

  public ngOnInit(): void {
    this.updateWeekBounds();
  }

  public ngAfterViewInit(): void {
    this.measureHeaderHeight();
    if (this.currentView === 'DAY') {
      setTimeout(() => this.triggerOneTimeScroll());
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['appointments'] && !this.hasAutoScrolled && this.currentView === 'DAY') {
      setTimeout(() => this.triggerOneTimeScroll());
    }
  }

  protected goToToday(): void {
    this.currentDate = new Date();
    this.updateWeekBounds();
  }

  protected goToPrevWeek(): void {
    this.currentView === 'DAY' ? this.shiftDay(-1) : this.shiftWeek(-7);
  }

  protected goToNextWeek(): void {
    this.currentView === 'DAY' ? this.shiftDay(1) : this.shiftWeek(7);
  }

  private shiftDay(days: number): void {
    this.currentDate = this.dateByOffset(this.currentDate, days);
    this.updateWeekBounds();
  }

  private shiftWeek(days: number): void {
    this.currentDate = this.dateByOffset(this.currentDate, days);
    this.updateWeekBounds();
  }

  private dateByOffset(from: Date, days: number): Date {
    const d = new Date(from);
    d.setDate(d.getDate() + days);
    return d;
  }

  protected setView(view: ConfigView): void {
    const savedScroll = this.readBodyScrollTop();
    this.currentView = view;

    if (this.hasAutoScrolled) {
      setTimeout(() => this.restoreBodyScrollTop(savedScroll));
    } else if (view === 'DAY') {
      setTimeout(() => this.triggerOneTimeScroll());
    }
  }

  private readBodyScrollTop(): number {
    return this.getAgendaBody()?.scrollTop ?? 0;
  }

  private restoreBodyScrollTop(top: number): void {
    const body = this.getAgendaBody();
    if (body) { body.scrollTop = top; }
  }

  protected get weekRangeLabel(): string {
    return this.currentView === 'DAY'
      ? this.formatSingleDayLabel()
      : this.formatWeekRangeLabel();
  }

  protected get isCurrentWeek(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today >= this.weekStart && today <= this.weekEnd;
  }

  private formatSingleDayLabel(): string {
    return this.currentDate.toLocaleDateString('es-CO', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  private formatWeekRangeLabel(): string {
    const dayOpt: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    const sameMonth = this.weekStart.getMonth() === this.weekEnd.getMonth();

    if (sameMonth) {
      const start = this.weekStart.toLocaleDateString('es-CO', dayOpt);
      const end = this.weekEnd.toLocaleDateString('es-CO', { day: 'numeric' });
      return `${start} – ${end}, ${this.weekEnd.getFullYear()}`;
    }

    const start = this.weekStart.toLocaleDateString('es-CO', dayOpt);
    const end = this.weekEnd.toLocaleDateString('es-CO', { ...dayOpt, year: 'numeric' });
    return `${start} – ${end}`;
  }

  private updateWeekBounds(): void {
    const { start, end } = this.calcWeekBounds(this.currentDate);
    this.weekStart = start;
    this.weekEnd = end;
    this.weekStartChange.emit(this.weekStart);
  }

  private calcWeekBounds(from: Date): { start: Date; end: Date } {
    const d = new Date(from);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    const start = new Date(d);
    start.setDate(d.getDate() + diff);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  protected onChipClick(payload: ChipClickPayload): void {
    const appt = payload.appointment;
    this.modalSvc.show({
      anchorX: payload.anchorX,
      anchorY: payload.anchorY,
      headerIcon: 'calendar_month',
      title: appt.services.map(s => s.name).join(', ') || 'Cita',
      subtitle: this.buildModalSubtitle(appt),
      statusKey: appt.status,
      statusLabel: this.statusToSpanish(appt.status),
      notes: appt.notes ?? null,
      actions: this.buildModalActions(appt),
    });
  }

  private buildModalSubtitle(appt: AppointmentCalendarItem): string {
    return this.sessionSvc.getRole() === 'CLIENT'
      ? `Serás atendido por: ${appt.worker.name}`
      : `Cliente: ${appt.client?.name ?? 'Sin cliente'}`;
  }

  private buildModalActions(appt: AppointmentCalendarItem) {
    return [
      this.buildPrimaryAction(appt),
      {
        icon: 'event_busy', label: 'Cancelar cita',
        handler: () => this.cancelAppointment.emit(appt),
        variant: 'danger' as const,
      },
    ];
  }

  private buildPrimaryAction(appt: AppointmentCalendarItem) {
    return this.sessionSvc.getRole() === 'CLIENT'
      ? { icon: 'event_repeat', label: 'Reagendar cita', handler: () => this.rescheduleAppointment.emit(appt) }
      : { icon: 'edit_calendar', label: 'Modificar cita', handler: () => this.modifyAppointment.emit(appt) };
  }

  private statusToSpanish(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Pendiente',
      SCHEDULED: 'Agendada',
      IN_PROGRESS: 'En progreso',
      COMPLETED: 'Completada',
    };
    return map[status] ?? status;
  }

  private triggerOneTimeScroll(): void {
    if (this.hasAutoScrolled || this.currentView !== 'DAY') { return; }
    if (!this.appointments.length) { return; }

    const now = new Date();
    const todayStr = this.toDayStr(now);

    if (this.toDayStr(this.currentDate) !== todayStr) {
      this.hasAutoScrolled = true;
      return;
    }

    const targetMin = this.resolveScrollTargetMin(now, todayStr);
    this.scrollBodyToMinute(targetMin);
    this.hasAutoScrolled = true;
  }

  private resolveScrollTargetMin(now: Date, todayStr: string): number {
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const nextApptMin = this.findNextAppointmentMin(todayStr, nowMin);
    return nextApptMin ?? nowMin;
  }

  private findNextAppointmentMin(todayStr: string, nowMin: number): number | null {
    return this.appointments
      .filter(a => a.startAt.startsWith(todayStr))
      .reduce<number | null>((best, a) => {
        const hit = a.startAt.match(/T(\d{2}):(\d{2})/);
        if (!hit) { return best; }
        const min = parseInt(hit[1], 10) * 60 + parseInt(hit[2], 10);
        if (min < nowMin) { return best; }
        return (best === null || min < best) ? min : best;
      }, null);
  }

  private scrollBodyToMinute(targetMin: number): void {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const topPx = (this.headerHeightRem + (targetMin / 30) * this.SCROLL_SLOT_H_REM) * rem;
    const body = this.getAgendaBody();
    if (body) {
      body.scrollTo({ top: Math.max(0, topPx - body.clientHeight * 0.30), behavior: 'smooth' });
    }
  }

  private measureHeaderHeight(): void {
    const header = this.gridRef?.nativeElement
      ?.querySelector('.wcg__day-header, .wdg__day-header');
    if (header) {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      this.headerHeightRem = header.getBoundingClientRect().height / rem;
    }
  }

  private getAgendaBody(): HTMLElement | null {
    return this.el.nativeElement.querySelector<HTMLElement>('.agenda__body');
  }

  private toDayStr(d: Date): string {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    return `${y}-${mo}-${dy}`;
  }
}
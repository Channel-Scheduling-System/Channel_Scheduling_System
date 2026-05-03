import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  eachDayOfInterval, addDays, addWeeks, subWeeks,
  addMonths, subMonths, format, isSameDay, isSameMonth,
  startOfDay, isToday, getDay
} from 'date-fns';
import { es } from 'date-fns/locale';
import { TimeSlot } from '../../interfaces/time-slot.interface';
import { CalendarView } from '../../types/calendar-view.types';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarPageComponent implements OnInit {

  protected currentView: CalendarView = 'week';
  protected currentDate: Date = new Date();
  protected isDeleteMode = false;

  protected timeSlots: TimeSlot[] = [];
  protected visibleDays: Date[] = [];
  protected weekDayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  @ViewChild('gridWrap') gridWrap!: ElementRef<HTMLElement>;

  public ngOnInit(): void {
    this.buildTimeSlots();
    this.buildVisibleDays();
  }

  public ngAfterViewInit(): void {
    this.scrollToCurrentTime();
  }

  public buildTimeSlots(): void {
    this.timeSlots = [];
    for (let h = 5; h <= 23; h++) {
      for (const m of [0, 30]) {
        const label = `${h % 12 === 0 ? 12 : h % 12}:${m === 0 ? '00' : '30'} ${h < 12 ? 'AM' : 'PM'}`;
        this.timeSlots.push({ hour: h, minute: m, label });
      }
    }
    this.timeSlots.push({ hour: 0, minute: 0, label: '12:00 AM' });
  }

  private buildVisibleDays(): void {
    if (this.currentView === 'day') {
      this.visibleDays = [this.currentDate];
    } else if (this.currentView === 'week') {
      const start = startOfWeek(this.currentDate, { locale: es });
      const end = endOfWeek(this.currentDate, { locale: es });
      this.visibleDays = eachDayOfInterval({ start, end });
    } else {
      const start = startOfMonth(this.currentDate);
      const end = endOfMonth(this.currentDate);
      const gridStart = startOfWeek(start, { locale: es });
      const gridEnd = endOfWeek(end, { locale: es });
      this.visibleDays = eachDayOfInterval({ start: gridStart, end: gridEnd });
    }
  }

  protected goToPrev(): void {
    if (this.currentView === 'day') {
      this.currentDate = addDays(this.currentDate, -1);
    } else if (this.currentView === 'week') {
      this.currentDate = subWeeks(this.currentDate, 1);
    } else {
      this.currentDate = subMonths(this.currentDate, 1);
    }
    this.buildVisibleDays();
  }

  protected goToNext(): void {
    if (this.currentView === 'day') {
      this.currentDate = addDays(this.currentDate, 1);
    } else if (this.currentView === 'week') {
      this.currentDate = addWeeks(this.currentDate, 1);
    } else {
      this.currentDate = addMonths(this.currentDate, 1);
    }
    this.buildVisibleDays();
  }

  protected goToToday(): void {
    this.currentDate = new Date();
    this.buildVisibleDays();
  }

  protected setView(view: CalendarView): void {
    this.currentView = view;
    this.buildVisibleDays();
  }

  protected get dateRangeLabel(): string {
    if (this.currentView === 'day') {
      return format(this.currentDate, "d 'de' MMMM yyyy", { locale: es });
    } else if (this.currentView === 'week') {
      const start = startOfWeek(this.currentDate, { locale: es });
      const end = endOfWeek(this.currentDate, { locale: es });
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, 'd', { locale: es })} – ${format(end, 'd MMM yyyy', { locale: es })}`;
      }
      return `${format(start, 'd MMM', { locale: es })} – ${format(end, 'd MMM yyyy', { locale: es })}`;
    } else {
      return format(this.currentDate, 'MMMM yyyy', { locale: es });
    }
  }

  private scrollToCurrentTime(): void {
    setTimeout(() => {
      const el = this.gridWrap?.nativeElement;
      if (!el) return;

      if (this.currentView === 'month') {
        const todayCell = el.querySelector('.cal-month__day--today') as HTMLElement;
        if (todayCell) {
          const offset = todayCell.offsetTop - el.clientHeight / 2 + todayCell.offsetHeight / 2;
          el.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
        }
        return;
      }

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const startHour = 5;

      const firstLabel = el.querySelector('.cal-grid__time-label') as HTMLElement;
      const slotHeight = firstLabel ? firstLabel.offsetHeight : 48;

      const slotsFromStart = (currentHour - startHour) * 2 + (currentMinute >= 30 ? 1 : 0);
      const scrollTop = Math.max(0, slotsFromStart * slotHeight - slotHeight * 2);

      el.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }, 100);
  }

  protected isCurrentMonth(day: Date): boolean {
    return isSameMonth(day, this.currentDate);
  }

  protected isDayToday(day: Date): boolean {
    return isToday(day);
  }

  protected isSelectedDay(day: Date): boolean {
    return isSameDay(day, this.currentDate);
  }

  protected formatDayNumber(day: Date): string {
    return format(day, 'd');
  }

  protected formatDayName(day: Date): string {
    return format(day, 'EEE', { locale: es });
  }

  protected formatMonthDayName(day: Date): string {
    return this.weekDayNames[getDay(day)];
  }

  protected trackByDay(_: number, day: Date): string {
    return day.toISOString();
  }

  protected trackBySlot(_: number, slot: TimeSlot): string {
    return `${slot.hour}:${slot.minute}`;
  }

  protected openWorkingHoursConfig(): void {
    // TODO: Tarea 2 — Abrir modal de configuración de horario base
  }

  protected openDayOffConfig(): void {
    // TODO: Tarea 3 — Abrir modal de configuración de día libre
  }

  protected openTimeBlockConfig(): void {
    // TODO: Tarea 4 — Abrir modal de configuración de bloqueo de tiempo
  }

  protected openVacationConfig(): void {
    // TODO: Tarea 5 — Abrir modal de configuración de vacaciones
  }

  protected toggleDeleteMode(): void {
    // TODO: Tarea 6 — Activar/desactivar modo eliminar
    this.isDeleteMode = !this.isDeleteMode;
  }

  protected onSlotClick(day: Date, slot: TimeSlot): void {
    // TODO: Tarea 4 — Iniciar creación de bloqueo de tiempo
  }

  protected onDayHeaderClick(day: Date): void {
    // TODO: Tarea 3 — Marcar día como libre
  }

  protected onMonthDayClick(day: Date): void {
    // TODO: Tarea 3/6 — Marcar día libre o eliminar en vista mes
  }

  protected onMonthDayPointerDown(day: Date): void {
    // TODO: Tarea 5 — Iniciar selección de rango de vacaciones
  }
}
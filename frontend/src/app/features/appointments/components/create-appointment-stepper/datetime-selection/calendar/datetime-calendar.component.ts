import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentCreateService } from '../../../../services/appointment-create.service';
import { DatetimeCalendarDayGridLayerComponent } from './grid-layer/datetime-calendar-day-grid-layer.component';
import { DatetimeCalendarDayAppointmentLayerComponent } from './appointment-layer/datetime-calendar-day-appointment-layer.component';
import { DatetimeCalendarDayAvailabilityLayerComponent } from './availability-layer/datetime-calendar-day-availability-layer.component';
import { DatetimeCalendarDaySelectionLayerComponent } from './selection-layer/datetime-calendar-day-selection-layer.component';
import type { AppointmentCalendarItem } from '../../../../interfaces/appointment-calendar.interface';
import type { WorkerAvailabilityDay, AvailabilitySlot } from '../../../../../calendar/models/responses/worker-availability-response.model';
const SCROLL_TOP_OFFSET_PX = 96;
const SCAN_START_HOUR = 8;
function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function isoToMin(iso: string): number {
  const h = parseInt(iso.slice(11, 13), 10);
  const m = parseInt(iso.slice(14, 16), 10);
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}
function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
@Component({
  selector: 'app-datetime-calendar',
  standalone: true,
  imports: [
    CommonModule,
    DatetimeCalendarDayGridLayerComponent,
    DatetimeCalendarDayAvailabilityLayerComponent,
    DatetimeCalendarDayAppointmentLayerComponent,
    DatetimeCalendarDaySelectionLayerComponent,
  ],
  templateUrl: './datetime-calendar.component.html',
  styleUrl: './datetime-calendar.component.scss',
})
export class DatetimeCalendarComponent implements OnInit, AfterViewInit, OnChanges {
  private readonly wizard = inject(AppointmentCreateService);
  private readonly zone = inject(NgZone);
  @Input() public workerId: number | null = null;
  @Input() public clientId: number | null = null;
  @Input() public clientAppointments: AppointmentCalendarItem[] = [];
  @Input() public availabilityDay: WorkerAvailabilityDay | null = null;
  @Output() public dateChange = new EventEmitter<Date>();
  @ViewChild('calendarBodyRef') private calendarBodyRef!: ElementRef<HTMLDivElement>;
  protected currentDate: Date = new Date();
  protected get isWorkerRole(): boolean {
    return this.wizard.userRole() === 'WORKER';
  }
  protected get dayLabel(): string {
    return this.currentDate.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  protected get isToday(): boolean {
    const today = new Date();
    return (
      this.currentDate.getDate() === today.getDate() &&
      this.currentDate.getMonth() === today.getMonth() &&
      this.currentDate.getFullYear() === today.getFullYear()
    );
  }
  protected get totalDuration(): number {
    return this.wizard.totalDuration();
  }
  public ngOnInit(): void {
    const selected = this.wizard.selectedDateTime();
    if (selected) {
      this.currentDate = new Date(selected);
      this.currentDate.setHours(0, 0, 0, 0);
      this.dateChange.emit(this.currentDate);
    } else {
      this.currentDate = new Date();
      this.currentDate.setHours(0, 0, 0, 0);
    }
  }
  public ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.zone.run(() => this.scrollToTarget());
        });
      });
    });
  }
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['availabilityDay'] || changes['clientAppointments']) {
      if (!this.wizard.selectedDateTime()) {
        this._scheduleScroll();
      }
    }
  }
  public scrollToDate(targetDate: Date, emitChange = false): void {
    const newDay = new Date(targetDate);
    newDay.setHours(0, 0, 0, 0);
    const dayChanged =
      newDay.getFullYear() !== this.currentDate.getFullYear() ||
      newDay.getMonth() !== this.currentDate.getMonth() ||
      newDay.getDate() !== this.currentDate.getDate();
    if (dayChanged) {
      this.currentDate = newDay;
      if (emitChange) {
        this.dateChange.emit(this.currentDate);
      }
    }
    this._scheduleScroll(targetDate);
  }
  public navigateDayOnly(targetDate: Date): void {
    const newDay = new Date(targetDate);
    newDay.setHours(0, 0, 0, 0);
    const dayChanged =
      newDay.getFullYear() !== this.currentDate.getFullYear() ||
      newDay.getMonth() !== this.currentDate.getMonth() ||
      newDay.getDate() !== this.currentDate.getDate();
    if (dayChanged) {
      this.currentDate = newDay;
    }
    this._scheduleScroll();
  }
  protected goToToday(): void {
    this.setDate(new Date());
  }
  protected goToPrevDay(): void {
    this.shiftDay(-1);
  }
  protected goToNextDay(): void {
    this.shiftDay(1);
  }
  private shiftDay(delta: number): void {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() + delta);
    this.setDate(d);
  }
  private setDate(date: Date): void {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    this.currentDate = d;
    this.dateChange.emit(this.currentDate);
    this._scheduleScroll();
  }
  protected onSlotSelected(dateTime: Date): void {
    this.wizard.setSelectedDateTime(dateTime);
  }
  public scrollToTarget(hint?: Date): void {
    const body = this.calendarBodyRef?.nativeElement;
    if (!body) return;
    const selected = hint ?? this.wizard.selectedDateTime();
    if (selected && toDateStr(selected) === toDateStr(this.currentDate)) {
      this.scrollToSelection(body, selected);
      return;
    }
    const freeStartMin = this.findNextFreeSlot();
    if (freeStartMin !== null) {
      this.scrollToMinutes(body, freeStartMin);
      return;
    }
    this.scrollToNow(body);
  }
  private scrollToNow(body: HTMLElement): void {
    const today = new Date();
    const isToday =
      this.currentDate.getFullYear() === today.getFullYear() &&
      this.currentDate.getMonth() === today.getMonth() &&
      this.currentDate.getDate() === today.getDate();
    const isPast = this.currentDate < today && !isToday;
    let totalMin: number;
    if (isToday) {
      totalMin = today.getHours() * 60 + today.getMinutes();
    } else if (isPast) {
      totalMin = 20 * 60; 
    } else {
      totalMin = SCAN_START_HOUR * 60; 
    }
    this.scrollToMinutes(body, totalMin);
  }
  private _scheduleScroll(hint?: Date): void {
    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.zone.run(() => this.scrollToTarget(hint));
        });
      });
    });
  }
  private scrollToSelection(body: HTMLElement, selected: Date): void {
    const hour = selected.getHours();
    const minute = selected.getMinutes();
    const cell = body.querySelector<HTMLElement>(
      `.dtsl__cell[data-hour="${hour}"][data-minute="${minute}"]`,
    );
    let targetScrollTop: number;
    if (cell) {
      targetScrollTop = this.offsetTopRelativeTo(cell, body) - SCROLL_TOP_OFFSET_PX;
    } else {
      const slotPx = this.measureSlotHeight(body);
      const startTotalMin = hour * 60 + minute;
      targetScrollTop = (startTotalMin / 30) * slotPx - SCROLL_TOP_OFFSET_PX;
    }
    body.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
  }
  private scrollToMinutes(body: HTMLElement, totalMin: number): void {
    const hour = Math.floor(totalMin / 60);
    const minute = totalMin % 60;
    const cell = body.querySelector<HTMLElement>(
      `.dtsl__cell[data-hour="${hour}"][data-minute="${minute}"]`,
    );
    let targetScrollTop: number;
    if (cell) {
      targetScrollTop = this.offsetTopRelativeTo(cell, body) - SCROLL_TOP_OFFSET_PX;
    } else {
      const slotPx = this.measureSlotHeight(body);
      targetScrollTop = (totalMin / 30) * slotPx - SCROLL_TOP_OFFSET_PX;
    }
    body.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
  }
  private findNextFreeSlot(): number | null {
    const durationMin = this.wizard.totalDuration();
    const MINUTES_IN_DAY = 24 * 60;
    const today = new Date();
    const isToday =
      this.currentDate.getFullYear() === today.getFullYear() &&
      this.currentDate.getMonth() === today.getMonth() &&
      this.currentDate.getDate() === today.getDate();
    let scanStart: number;
    if (isToday) {
      const nowMin = today.getHours() * 60 + today.getMinutes();
      scanStart = Math.ceil(nowMin / 30) * 30;
    } else {
      scanStart = SCAN_START_HOUR * 60;
    }
    const blocked: Array<{ s: number; e: number }> = [];
    if (this.availabilityDay) {
      const available = this.availabilityDay.available;
      if (available.length === 0) {
        return null;
      }
      const sorted = [...available]
        .map(sl => ({ s: timeToMin(sl.start), e: timeToMin(sl.end) }))
        .sort((a, b) => a.s - b.s);
      let cursor = 0;
      for (const { s, e } of sorted) {
        if (s > cursor) blocked.push({ s: cursor, e: s });
        cursor = Math.max(cursor, e);
      }
      if (cursor < MINUTES_IN_DAY) {
        blocked.push({ s: cursor, e: MINUTES_IN_DAY });
      }
      for (const slot of this.availabilityDay.occupied) {
        blocked.push({ s: timeToMin(slot.start), e: timeToMin(slot.end) });
      }
    }
    const dateStr = toDateStr(this.currentDate);
    for (const appt of this.clientAppointments) {
      if (appt.startAt.slice(0, 10) === dateStr) {
        blocked.push({ s: isoToMin(appt.startAt), e: isoToMin(appt.endAt) });
      }
    }
    blocked.sort((a, b) => a.s - b.s);
    let candidate = Math.round(scanStart / 30) * 30; 
    while (candidate + durationMin <= MINUTES_IN_DAY) {
      const end = candidate + durationMin;
      const conflict = blocked.find(r => r.s < end && r.e > candidate);
      if (!conflict) {
        return candidate;
      }
      candidate = Math.ceil(conflict.e / 30) * 30;
    }
    return null; 
  }
  private offsetTopRelativeTo(el: HTMLElement, ancestor: HTMLElement): number {
    let top = 0;
    let cursor: HTMLElement | null = el;
    while (cursor && cursor !== ancestor) {
      top += cursor.offsetTop;
      cursor = cursor.offsetParent as HTMLElement | null;
    }
    return top;
  }
  private measureSlotHeight(body: HTMLElement): number {
    const cell = body.querySelector<HTMLElement>('.dtsl__cell');
    if (cell) return cell.getBoundingClientRect().height;
    return parseFloat(getComputedStyle(document.documentElement).fontSize) * 3;
  }
}
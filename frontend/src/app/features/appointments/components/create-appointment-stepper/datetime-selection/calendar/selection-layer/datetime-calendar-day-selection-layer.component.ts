import {
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
  effect,
  untracked,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentCalendarGridBase } from '../../../../appointment-calendar-grid/appointment-calendar-grid.base';
import { AppointmentCreateService } from '../../../../../services/appointment-create.service';
import { MessageService } from '../../../../../../../core/services/message.service';
import { TimeSlot } from '../../../../../interfaces/time-slot.interface';
import type { AppointmentCalendarItem } from '../../../../../interfaces/appointment-calendar.interface';
import type { WorkerAvailabilityDay, AvailabilitySlot } from '../../../../../../calendar/models/responses/worker-availability-response.model';
interface SelectionRect {
  topPx: number;
  heightPx: number;
  startLabel: string;
  endLabel: string;
}
/** Total minutes in a day — the end of the appointment must not exceed this */
const MINUTES_IN_DAY = 24 * 60; 
/** Returns true when [aStart, aEnd) overlaps [bStart, bEnd) */
function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart;
}
/** Parses "HH:mm" → total minutes from midnight */
function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
/**
 * Extracts "yyyy-MM-dd" from a datetime string by slicing the first 10 chars.
 * Works regardless of separator (T or space) and without new Date() conversion.
 *   "2025-06-01T14:30:00Z"    → "2025-06-01"
 *   "2025-06-01 14:30:00"     → "2025-06-01"
 *   "2025-06-01T14:30:00-05:00" → "2025-06-01"
 */
function apptDateStr(iso: string): string {
  return iso.slice(0, 10);
}
/**
 * Extracts total minutes from midnight from a datetime string by slicing
 * positions 11-12 (HH) and 14-15 (mm) — no new Date(), no timezone shift.
 *   "2025-06-01T14:30:00Z" → 870  (14h × 60 + 30)
 *   "2025-06-01 08:00:00"  → 480  ( 8h × 60 +  0)
 */
function apptToMin(iso: string): number {
  const h = parseInt(iso.slice(11, 13), 10);
  const m = parseInt(iso.slice(14, 16), 10);
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}
@Component({
  selector: 'app-datetime-calendar-day-selection-layer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './datetime-calendar-day-selection-layer.component.html',
  styleUrl: './datetime-calendar-day-selection-layer.component.scss',
})
export class DatetimeCalendarDaySelectionLayerComponent
  extends AppointmentCalendarGridBase
  implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private readonly wizard = inject(AppointmentCreateService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly messages = inject(MessageService);
  @Input() public currentDate!: Date;
  /** Client appointments — used for conflict detection (Layer 4 data) */
  @Input() public clientAppointments: AppointmentCalendarItem[] = [];
  /** Worker availability — used for conflict detection (Layer 3 data) */
  @Input() public availabilityDay: WorkerAvailabilityDay | null = null;
  @Output() public slotSelected = new EventEmitter<Date>();
  @ViewChild('cellsWrapRef') private cellsWrapRef!: ElementRef<HTMLDivElement>;
  protected selectionRect: SelectionRect | null = null;
  /** Whether the current selectionRect overlaps a blocked range or is in the past */
  protected isRangeInvalid = false;
  /** Human-readable reason for the invalid state — shown inside the rect */
  protected invalidReasons: string[] = [];
  protected hoverSlot: TimeSlot | null = null;
  protected get ghostRect(): SelectionRect | null {
    if (!this.hoverSlot) return null;
    const durationMin = this.wizard.totalDuration();
    const rawStartMin = this.hoverSlot.hour * 60 + this.hoverSlot.minute;
    const startTotalMin = Math.min(rawStartMin, MINUTES_IN_DAY - durationMin);
    const slotPx = this.slotHeightPx;
    const topPx = (startTotalMin / 30) * slotPx;
    const heightPx = (durationMin / 30) * slotPx;
    const endTotalMin = startTotalMin + durationMin;
    return {
      topPx,
      heightPx,
      startLabel: this.formatTime(Math.floor(startTotalMin / 60), startTotalMin % 60),
      endLabel: this.formatTime(Math.floor(endTotalMin / 60) % 24, endTotalMin % 60),
    };
  }
  protected isDragging = false;
  private _dragStartMin = 0;
  private _dragStartY = 0;
  private _onMouseMove!: (e: MouseEvent) => void;
  private _onMouseUp!: (e: MouseEvent) => void;
  private _onTouchMove!: (e: TouchEvent) => void;
  private _onTouchEnd!: (e: TouchEvent) => void;
  protected isShaking = false;
  private _shakeTimeout: ReturnType<typeof setTimeout> | null = null;
  constructor() {
    super();
    effect(() => {
      const selectedDt = this.wizard.selectedDateTime();
      const durationMin = this.wizard.totalDuration();
      untracked(() => {
        if (!selectedDt) {
          this.selectionRect = null;
          this.isRangeInvalid = false;
          this.invalidReasons = [];
          return;
        }
        const startTotalMin = selectedDt.getHours() * 60 + selectedDt.getMinutes();
        if (startTotalMin + durationMin > MINUTES_IN_DAY) {
          const clampedStart = MINUTES_IN_DAY - durationMin;
          const clamped = new Date(selectedDt);
          clamped.setHours(Math.floor(clampedStart / 60), clampedStart % 60, 0, 0);
          this.wizard.setSelectedDateTime(clamped);
          return;
        }
        if (this.isSameDay(selectedDt, this.currentDate)) {
          this.buildRectFromDate(selectedDt);
          this.evaluateConflicts();
        } else {
          this.selectionRect = null;
          this.isRangeInvalid = false;
          this.invalidReasons = [];
        }
      });
    });
  }
  public override ngOnInit(): void {
    super.ngOnInit();
  }
  public ngAfterViewInit(): void {
    this.repositionHost();
  }
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentDate'] && !changes['currentDate'].firstChange) {
      this.repositionHost();
      const selectedDt = this.wizard.selectedDateTime();
      if (selectedDt && this.isSameDay(selectedDt, this.currentDate)) {
        requestAnimationFrame(() => {
          this.buildRectFromDate(selectedDt);
          this.evaluateConflicts();
        });
      } else {
        this.selectionRect = null;
        this.isRangeInvalid = false;
        this.invalidReasons = [];
      }
    }
    if ((changes['clientAppointments'] || changes['availabilityDay']) && this.selectionRect) {
      this.evaluateConflicts();
    }
  }
  public ngOnDestroy(): void {
    this._detachDragListeners();
    if (this._shakeTimeout !== null) clearTimeout(this._shakeTimeout);
  }
  private repositionHost(): void {
    const dayWrap = this.host.nativeElement.closest('.dt-agenda__day-wrap') as HTMLElement | null;
    if (!dayWrap) return;
    const gridHeader = dayWrap.querySelector('.dtg__day-header') as HTMLElement | null;
    if (!gridHeader) return;
    this.host.nativeElement.style.top = `${gridHeader.getBoundingClientRect().height}px`;
  }
  protected onCellClick(slot: TimeSlot): void {
    const rawStartMin = slot.hour * 60 + slot.minute;
    const durationMin = this.wizard.totalDuration();
    const startTotalMin = Math.min(rawStartMin, MINUTES_IN_DAY - durationMin);
    const slotDate = new Date(this.currentDate);
    slotDate.setHours(Math.floor(startTotalMin / 60), startTotalMin % 60, 0, 0);
    if (this.isInPast(slotDate)) {
      this.messages.showMessage('No se puede agendar una cita en una fecha y hora pasadas', 'warning');
      return;
    }
    const clampedSlot: TimeSlot = {
      hour: Math.floor(startTotalMin / 60),
      minute: (startTotalMin % 60) as TimeSlot['minute'],
      label: this.formatTime(Math.floor(startTotalMin / 60), startTotalMin % 60),
    };
    this.hoverSlot = null;
    this.buildRect(clampedSlot);
    this.evaluateConflicts();
    this.emitSelection(clampedSlot);
  }
  protected onCellMouseEnter(slot: TimeSlot): void {
    this.hoverSlot = slot;
  }
  protected onCellMouseLeave(): void {
    this.hoverSlot = null;
  }
  protected onRectMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const current = this.wizard.selectedDateTime();
    if (!current) return;
    this._dragStartMin = current.getHours() * 60 + current.getMinutes();
    this._dragStartY = event.clientY;
    this.zone.runOutsideAngular(() => {
      this._onMouseMove = (e: MouseEvent) => this._handleDragMove(e.clientY);
      this._onMouseUp = () => this._handleDragEnd();
      document.addEventListener('mousemove', this._onMouseMove);
      document.addEventListener('mouseup', this._onMouseUp);
    });
    this.isDragging = true;
  }
  protected onRectTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) return;
    event.stopPropagation();
    const current = this.wizard.selectedDateTime();
    if (!current) return;
    this._dragStartMin = current.getHours() * 60 + current.getMinutes();
    this._dragStartY = event.touches[0].clientY;
    this.zone.runOutsideAngular(() => {
      this._onTouchMove = (e: TouchEvent) => {
        if (e.cancelable) e.preventDefault();
        if (e.touches.length === 1) this._handleDragMove(e.touches[0].clientY);
      };
      this._onTouchEnd = () => this._handleDragEnd();
      document.addEventListener('touchmove', this._onTouchMove, { passive: false });
      document.addEventListener('touchend', this._onTouchEnd);
      document.addEventListener('touchcancel', this._onTouchEnd);
    });
    this.isDragging = true;
  }
  private _handleDragMove(clientY: number): void {
    const deltaY = clientY - this._dragStartY;
    const slotPx = this.slotHeightPx;
    const durationMin = this.wizard.totalDuration();
    const slotDelta = Math.round(deltaY / slotPx);
    let newStartMin = this._dragStartMin + slotDelta * 30;
    newStartMin = Math.max(0, newStartMin);
    newStartMin = Math.min(newStartMin, MINUTES_IN_DAY - durationMin);
    newStartMin = Math.round(newStartMin / 30) * 30;
    const newHour = Math.floor(newStartMin / 60);
    const newMinute = newStartMin % 60;
    this.zone.run(() => {
      this._buildRectPreview(newHour, newMinute);
      this.evaluateConflicts();
    });
  }
  private _handleDragEnd(): void {
    this._detachDragListeners();
    const rect = this.selectionRect;
    if (rect) {
      const slotPx = this.slotHeightPx;
      const startTotalMin = Math.round((rect.topPx / slotPx) * 30);
      const newHour = Math.floor(startTotalMin / 60);
      const newMinute = startTotalMin % 60;
      const updated = new Date(this.currentDate);
      updated.setHours(newHour, newMinute, 0, 0);
      if (this.isInPast(updated)) {
        this.messages.showMessage('No se puede agendar una cita en una fecha y hora pasadas', 'warning');
        const prev = this.wizard.selectedDateTime();
        this.zone.run(() => {
          this.isDragging = false;
          if (prev) {
            this.buildRectFromDate(prev);
            this.evaluateConflicts();
          } else {
            this.selectionRect = null;
          }
        });
        return;
      }
      this.zone.run(() => {
        this.isDragging = false;
        this.wizard.setSelectedDateTime(updated);
        this.slotSelected.emit(updated);
        this.evaluateConflicts();
      });
    } else {
      this.zone.run(() => { this.isDragging = false; });
    }
  }
  private _detachDragListeners(): void {
    if (this._onMouseMove) document.removeEventListener('mousemove', this._onMouseMove);
    if (this._onMouseUp) document.removeEventListener('mouseup', this._onMouseUp);
    if (this._onTouchMove) document.removeEventListener('touchmove', this._onTouchMove);
    if (this._onTouchEnd) {
      document.removeEventListener('touchend', this._onTouchEnd);
      document.removeEventListener('touchcancel', this._onTouchEnd);
    }
  }
  private buildRect(slot: TimeSlot): void {
    const slotPx = this.slotHeightPx;
    const durationMin = this.wizard.totalDuration();
    const startTotalMin = slot.hour * 60 + slot.minute;
    const topPx = (startTotalMin / 30) * slotPx;
    const heightPx = (durationMin / 30) * slotPx;
    const endTotalMin = startTotalMin + durationMin;
    const endHour = Math.floor(endTotalMin / 60) % 24;
    const endMinute = endTotalMin % 60;
    this.selectionRect = {
      topPx,
      heightPx,
      startLabel: this.formatTime(slot.hour, slot.minute),
      endLabel: this.formatTime(endHour, endMinute),
    };
  }
  private _buildRectPreview(hour: number, minute: number): void {
    const slotPx = this.slotHeightPx;
    const durationMin = this.wizard.totalDuration();
    const startTotalMin = hour * 60 + minute;
    const topPx = (startTotalMin / 30) * slotPx;
    const heightPx = (durationMin / 30) * slotPx;
    const endTotalMin = startTotalMin + durationMin;
    const endHour = Math.floor(endTotalMin / 60) % 24;
    const endMinute = endTotalMin % 60;
    this.selectionRect = {
      topPx,
      heightPx,
      startLabel: this.formatTime(hour, minute),
      endLabel: this.formatTime(endHour, endMinute),
    };
  }
  private buildRectFromDate(date: Date): void {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const slot: TimeSlot = {
      hour,
      minute: minute as TimeSlot['minute'],
      label: this.formatTime(hour, minute),
    };
    this.buildRect(slot);
  }
  private emitSelection(slot: TimeSlot): void {
    const d = new Date(this.currentDate);
    d.setHours(slot.hour, slot.minute, 0, 0);
    this.slotSelected.emit(d);
  }
  /**
   * Evaluates whether the current selectionRect conflicts with:
   *  1. A past date/time
   *  2. An existing client appointment  ← uses string-slice parsing, no new Date()
   *  3. A worker-occupied slot
   *  4. An out-of-hours (unavailable) period
   *
   * Priority order: each condition adds at most ONE reason.
   * Only the highest-priority reason is surfaced to the user.
   */
  private evaluateConflicts(): void {
    if (!this.selectionRect) {
      this.isRangeInvalid = false;
      this.invalidReasons = [];
      return;
    }
    const slotPx = this.slotHeightPx;
    const startTotalMin = Math.round((this.selectionRect.topPx / slotPx) * 30);
    const durationMin = this.wizard.totalDuration();
    const endTotalMin = startTotalMin + durationMin;
    const reasons: string[] = [];
    const startDate = new Date(this.currentDate);
    startDate.setHours(Math.floor(startTotalMin / 60), startTotalMin % 60, 0, 0);
    if (this.isInPast(startDate)) {
      reasons.push('Fecha y hora pasadas');
    }
    if (this.clientAppointments.length > 0) {
      const dateStr = this.formatDateStr(this.currentDate);
      const dayAppts = this.clientAppointments.filter(
        a => apptDateStr(a.startAt) === dateStr,
      );
      const hasClientConflict = dayAppts.some(appt =>
        rangesOverlap(
          startTotalMin, endTotalMin,
          apptToMin(appt.startAt), apptToMin(appt.endAt),
        ),
      );
      if (hasClientConflict) {
        reasons.push('Conflicto con una cita existente');
      }
    }
    if (this.availabilityDay) {
      const isWorker = this.wizard.userRole() === 'WORKER';
      if (!isWorker) {
        const hasOccupiedConflict = this.availabilityDay.occupied.some(slot =>
          rangesOverlap(
            startTotalMin, endTotalMin,
            timeToMin(slot.start), timeToMin(slot.end),
          ),
        );
        if (hasOccupiedConflict) {
          reasons.push('Horario ocupado por el estilista');
        }
      }
      const coverageSlots = isWorker
        ? [...this.availabilityDay.available, ...this.availabilityDay.occupied]
        : this.availabilityDay.available;
      const isOutOfHours =
        coverageSlots.length === 0 ||
        !this.isRangeCoveredByAvailability(
          startTotalMin,
          endTotalMin,
          coverageSlots,
        );
      if (isOutOfHours) {
        reasons.push('Fuera del horario laboral del estilista');
      }
    }
    const wasInvalid = this.isRangeInvalid;
    this.isRangeInvalid = reasons.length > 0;
    this.invalidReasons = reasons.length > 0 ? [reasons[0]] : [];
    if (this.isRangeInvalid) {
      if (this._shakeTimeout !== null) {
        clearTimeout(this._shakeTimeout);
        this.isShaking = false;
      }
      setTimeout(() => {
        this.isShaking = true;
        this._shakeTimeout = setTimeout(() => {
          this.isShaking = false;
          this._shakeTimeout = null;
        }, 420); 
      }, 0);
    }
  }
  /**
   * Returns true only when every minute in [startMin, endMin) is covered by
   * at least one available slot — i.e. the range is fully within working hours.
   */
  private isRangeCoveredByAvailability(
    startMin: number,
    endMin: number,
    available: AvailabilitySlot[],
  ): boolean {
    const sorted = available
      .map(s => ({ s: timeToMin(s.start), e: timeToMin(s.end) }))
      .sort((a, b) => a.s - b.s);
    let cursor = startMin;
    for (const { s, e } of sorted) {
      if (s > cursor) break;      
      if (e > cursor) cursor = e; 
      if (cursor >= endMin) return true;
    }
    return cursor >= endMin;
  }
  private isInPast(date: Date): boolean {
    return date.getTime() < Date.now();
  }
  /** Formats a Date as "yyyy-MM-dd" using LOCAL time — matches apptDateStr() */
  private formatDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
  private formatTime(hour: number, minute: number): string {
    const h = hour % 12 || 12;
    const mm = String(minute).padStart(2, '0');
    const ampm = hour < 12 ? 'am' : 'pm';
    return `${h}:${mm} ${ampm}`;
  }
  private get slotHeightPx(): number {
    if (this.cellsWrapRef) {
      const firstCell = this.cellsWrapRef.nativeElement
        .querySelector('.dtsl__cell') as HTMLElement | null;
      if (firstCell) return firstCell.getBoundingClientRect().height;
    }
    return this.remToPx(3);
  }
  private remToPx(rem: number): number {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  }
}
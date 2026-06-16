import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Input, Output } from '@angular/core';
import { format, isSameMonth, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AvailabilityConfigData } from '../../../models/responses/availability-response.model';
import { CalendarCellService } from '../../../services/calendar-cell.service';
import { CalendarTooltipService } from '../../../ui/calendar-tooltip.service';
@Component({
  selector: '[appCalendarGridMonth]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-grid-month.component.html',
})
export class CalendarGridMonthComponent {
  @Input() public visibleDays: Date[] = [];
  @Input() public currentDate: Date = new Date();
  @Input() public weekDayNames: string[] = [];
  @Input() public availabilityData: AvailabilityConfigData | null = null;
  @Input() public deleteMode = false;
  @Output() public deleteEntity = new EventEmitter<number>();
  @Output() weekdayHeaderContextMenu = new EventEmitter<{ day: Date; x: number; y: number }>();
  @Output() monthDayContextMenu = new EventEmitter<{ day: Date; x: number; y: number }>();
  @Output() public monthDayClick = new EventEmitter<Date>();
  @Output() public monthDayPointerDown = new EventEmitter<Date>();
  @Output() public selectionComplete = new EventEmitter<{
    startDay: Date;
    endDay: Date;
    x: number;
    y: number;
  }>();
  protected hoveredGroupId: string | null = null;
  protected isDragging = false;
  protected hasSelection = false;
  protected dragStartIdx = -1;
  protected dragEndIdx = -1;
  protected dragMinIdx = -1;
  protected dragMaxIdx = -1;
  private didDrag = false;
  private _touchStartX = 0;
  private _touchStartY = 0;
  private _touchDecided = false;
  private readonly _touchMoveFn = (e: TouchEvent) => this._onTouchMove(e);
  private readonly _touchEndFn = (e: TouchEvent) => this._onTouchEnd(e);
  private readonly tooltipSvc = inject(CalendarTooltipService);
  public constructor(public readonly cellService: CalendarCellService) { }
  @HostListener('document:mouseup', ['$event'])
  protected onDocumentMouseUp(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    if (this.dragStartIdx < 0) return;
    this.hasSelection = true;
    this.didDrag = this.dragStartIdx !== this.dragEndIdx;
    const [start, end] = this.getRange();
    this.selectionComplete.emit({
      startDay: this.visibleDays[start],
      endDay: this.visibleDays[end],
      x: event.clientX,
      y: event.clientY,
    });
  }
  protected onCellMouseDown(event: MouseEvent, day: Date, index: number): void {
    if (event.button !== 0) return;
    if (this.deleteMode) {
      const group = this.cellService.getMonthDayGroup(day);
      if (group) this.deleteEntity.emit(group.id);
      return;
    }
    if (!this.isCellFree(day)) return;
    event.preventDefault();
    this.hasSelection = false;
    this.isDragging = true;
    this.didDrag = false;
    this.dragStartIdx = index;
    this.dragEndIdx = index;
    const rowStart = Math.floor(index / 7) * 7;
    const rowEnd = rowStart + 6;
    let maxIdx = index;
    for (let i = index + 1; i <= rowEnd && i < this.visibleDays.length; i++) {
      if (!this.isCellFree(this.visibleDays[i])) break;
      maxIdx = i;
    }
    this.dragMaxIdx = maxIdx;
    let minIdx = index;
    for (let i = index - 1; i >= rowStart; i--) {
      if (!this.isCellFree(this.visibleDays[i])) break;
      minIdx = i;
    }
    this.dragMinIdx = minIdx;
  }
  protected onCellMouseEnter(day: Date, index: number): void {
    if (!this.isDragging) return;
    const startRow = Math.floor(this.dragStartIdx / 7);
    if (Math.floor(index / 7) !== startRow) return;
    const clamped = Math.max(this.dragMinIdx, Math.min(this.dragMaxIdx, index));
    this.dragEndIdx = clamped;
  }
  protected onCellContextMenu(event: MouseEvent, day: Date, index: number): void {
    event.preventDefault();
    if (this.hasSelection && this.isCellInSelection(index)) {
      const [start, end] = this.getRange();
      this.selectionComplete.emit({
        startDay: this.visibleDays[start],
        endDay: this.visibleDays[end],
        x: event.clientX,
        y: event.clientY,
      });
      return;
    }
    this.monthDayContextMenu.emit({ day, x: event.clientX, y: event.clientY });
  }
  protected onWeekdayHeaderContextMenu(event: MouseEvent, weekdayName: string): void {
    event.preventDefault();
    const day =
      this.visibleDays.find(d =>
        format(d, 'EEE', { locale: es })
          .toLowerCase()
          .startsWith(weekdayName.toLowerCase().charAt(0)),
      ) ?? this.visibleDays[0];
    if (!day) return;
    this.weekdayHeaderContextMenu.emit({ day, x: event.clientX, y: event.clientY });
  }
  protected isCellInSelection(index: number): boolean {
    if (!this.isDragging && !this.hasSelection) return false;
    const [start, end] = this.getRange();
    return index >= start && index <= end;
  }
  protected isCellSelectionStart(index: number): boolean {
    if (!this.isDragging && !this.hasSelection) return false;
    return index === this.getRange()[0];
  }
  protected isCellSelectionEnd(index: number): boolean {
    if (!this.isDragging && !this.hasSelection) return false;
    return index === this.getRange()[1];
  }
  private getRange(): [number, number] {
    return [Math.min(this.dragStartIdx, this.dragEndIdx), Math.max(this.dragStartIdx, this.dragEndIdx)];
  }
  protected onWeekdayHeaderClick(event: MouseEvent, weekdayName: string): void {
    const day =
      this.visibleDays.find(d =>
        format(d, 'EEE', { locale: es }).toLowerCase() === weekdayName.toLowerCase(),
      ) ?? this.visibleDays[0];
    if (!day) return;
    this.weekdayHeaderContextMenu.emit({ day, x: event.clientX, y: event.clientY });
  }
  private isCellFree(day: Date): boolean {
    if (!this.availabilityData) return true;
    if (this.cellService.isInPeriodOff(day)) return false;
    if (this.cellService.isDayOff(day)) return false;
    return true;
  }
  protected isCurrentMonth(day: Date): boolean {
    return isSameMonth(day, this.currentDate);
  }
  protected isDayToday(day: Date): boolean {
    return isToday(day);
  }
  protected formatDayNumber(day: Date): string {
    return format(day, 'd');
  }
  protected trackByDay(_: number, day: Date): string {
    return day.toISOString();
  }
  protected onMonthDayClick(day: Date): void {
    this.monthDayClick.emit(day);
  }
  protected onMonthDayPointerDown(day: Date): void {
    this.monthDayPointerDown.emit(day);
  }
  protected onDayEnter(event: MouseEvent, day: Date): void {
    const group = this.cellService.getMonthDayGroup(day);
    this.hoveredGroupId = group ? `${group.kind}-${group.id}` : null;
    if (group) {
      const data = this.cellService.getTooltipDataForGroup(group);
      if (data) this.tooltipSvc.schedule(event.clientX, event.clientY, data);
    }
  }
  protected onDayLeave(): void {
    this.hoveredGroupId = null;
    this.tooltipSvc.hide();
  }
  protected onDayMove(event: MouseEvent, day: Date): void {
    const group = this.cellService.getMonthDayGroup(day);
    if (!group) return;
    this.tooltipSvc.resetTimer(event.clientX, event.clientY);
  }
  protected hoveredKind(day: Date): string | null {
    if (!this.hoveredGroupId) return null;
    const group = this.cellService.getMonthDayGroup(day);
    if (!group) return null;
    return `${group.kind}-${group.id}` === this.hoveredGroupId ? group.kind : null;
  }
  private _getSingleTouch(event: TouchEvent): Touch | null {
    return event.touches.length === 1 ? event.touches[0] : null;
  }
  private _resetTouchState(touch: Touch): void {
    this._touchStartX = touch.clientX;
    this._touchStartY = touch.clientY;
    this._touchDecided = false;
  }
  private _attachTouchListeners(): void {
    document.addEventListener('touchmove', this._touchMoveFn, { passive: false });
    document.addEventListener('touchend', this._touchEndFn, { once: true });
    document.addEventListener('touchcancel', this._touchEndFn, { once: true });
  }
  private _detachTouchListeners(): void {
    document.removeEventListener('touchmove', this._touchMoveFn);
    document.removeEventListener('touchend', this._touchEndFn);
    document.removeEventListener('touchcancel', this._touchEndFn);
  }
  private _startTouchSelection(index: number): void {
    this.hasSelection = false;
    this.isDragging = true;
    this.didDrag = false;
    this.dragStartIdx = index;
    this.dragEndIdx = index;
    this._setSelectionBounds(index);
  }
  private _setSelectionBounds(index: number): void {
    const rowStart = Math.floor(index / 7) * 7;
    const rowEnd = rowStart + 6;

    let maxIdx = index;
    for (let i = index + 1; i <= rowEnd && i < this.visibleDays.length; i++) {
      if (!this._isFree(this.visibleDays[i])) break;
      maxIdx = i;
    }
    this.dragMaxIdx = maxIdx;

    let minIdx = index;
    for (let i = index - 1; i >= rowStart; i--) {
      if (!this._isFree(this.visibleDays[i])) break;
      minIdx = i;
    }
    this.dragMinIdx = minIdx;
  }
  private _decideTouchGesture(touch: Touch): 'waiting' | 'cancel' | 'continue' {
    if (this._touchDecided) return 'continue';

    const dx = Math.abs(touch.clientX - this._touchStartX);
    const dy = Math.abs(touch.clientY - this._touchStartY);
    if (dx < 6 && dy < 6) return 'waiting';

    this._touchDecided = true;
    if (dy > dx) {
      this._cancelTouchSelection();
      return 'cancel';
    }

    return 'continue';
  }
  private _cancelTouchSelection(): void {
    this.isDragging = false;
    this._detachTouchListeners();
  }
  private _getMonthCellIndexFromPoint(touch: Touch): number | null {
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
      ?.closest<HTMLElement>('.cal-month__day');
    const idxStr = el?.dataset['index'];
    if (!idxStr) return null;
    const idx = parseInt(idxStr, 10);
    return Number.isNaN(idx) ? null : idx;
  }
  private _isSameRow(index: number): boolean {
    return Math.floor(index / 7) === Math.floor(this.dragStartIdx / 7);
  }
  private _updateDragEnd(index: number): void {
    const clamped = Math.max(this.dragMinIdx, Math.min(this.dragMaxIdx, index));
    this.dragEndIdx = clamped;
    if (clamped !== this.dragStartIdx) this.didDrag = true;
  }
  private _finalizeTouchSelection(touch: Touch | null): void {
    if (this.dragStartIdx < 0) return;
    this.hasSelection = true;
    const [start, end] = this.getRange();
    this.selectionComplete.emit({
      startDay: this.visibleDays[start],
      endDay: this.visibleDays[end],
      x: touch?.clientX ?? 0,
      y: touch?.clientY ?? 0,
    });
  }
  protected onCellTouchStart(event: TouchEvent, day: Date, index: number): void {
    const touch = this._getSingleTouch(event);
    if (!touch) return;

    if (this.deleteMode) {
      const group = this.cellService.getMonthDayGroup(day);
      if (group) this.deleteEntity.emit(group.id);
      return;
    }

    if (!this._isFree(day)) return;

    this._resetTouchState(touch);
    this._startTouchSelection(index);
    this._attachTouchListeners();
  }

  private _onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;
    const touch = this._getSingleTouch(event);
    if (!touch) return;

    const decision = this._decideTouchGesture(touch);
    if (decision !== 'continue') return;

    event.preventDefault();

    const idx = this._getMonthCellIndexFromPoint(touch);
    if (idx === null || !this._isSameRow(idx)) return;
    this._updateDragEnd(idx);
  }

  private _onTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this._detachTouchListeners();
    if (!this.isDragging) return;
    this.isDragging = false;
    const touch = event.changedTouches[0] ?? null;
    this._finalizeTouchSelection(touch);
  }

  private _isFree(day: Date): boolean {
    if (!this.availabilityData) return true;
    return !this.cellService.isInPeriodOff(day) && !this.cellService.isDayOff(day);
  }
}

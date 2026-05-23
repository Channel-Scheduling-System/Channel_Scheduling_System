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
}

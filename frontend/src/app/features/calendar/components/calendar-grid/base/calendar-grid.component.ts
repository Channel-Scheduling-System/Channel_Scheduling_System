import {
  Directive, EventEmitter, HostBinding, HostListener,
  inject, Input, Output, SimpleChanges,
} from '@angular/core';
import { format, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TimeSlot } from '../../../interfaces/time-slot.interface';
import type { AvailabilityConfigData } from '../../../models/responses/availability-response.model';
import type { CellSegment } from '../../../interfaces/cell-segment.interface';
import { CalendarCellService } from '../../../services/calendar-cell.service';
import { CalendarTooltipService } from '../../../ui/calendar-tooltip.service';
const MIN_BOUNDARY_GAP       = 1;
@Directive()
export abstract class CalendarGridBase {
  @Input() public currentDate: Date = new Date();
  @Input() public timeSlots: TimeSlot[] = [];
  @Input() public availabilityData: AvailabilityConfigData | null = null;
  @Input() public deleteMode = false;
  @Output() public deleteEntity = new EventEmitter<number>();
  @Output() public slotClick = new EventEmitter<{ day: Date; slot: TimeSlot }>();
  @Output() public dayHeaderClick = new EventEmitter<{ day: Date; x: number; y: number }>();
  @Output() public headerHeightChange = new EventEmitter<number>();
  @Output() public selectionComplete = new EventEmitter<{ day: Date; startSlot: TimeSlot; endSlot: TimeSlot; x: number; y: number }>();
  @Output() public boundaryChange = new EventEmitter<{ day: Date; type: 'start' | 'end'; newSlot: TimeSlot; originalSlot: TimeSlot }>();
  public readonly cellService = inject(CalendarCellService);
  protected readonly tooltipSvc = inject(CalendarTooltipService);
  protected isDragging = false;
  protected dragDay: Date | null = null;
  protected dragStartIdx = -1;
  protected dragEndIdx = -1;
  protected dragMinIdx = -1;
  protected dragMaxIdx = -1;
  protected hasSelection = false;
  private didDrag = false;
  @HostBinding('class.cal-grid--no-sel-transition')
  protected isDeselecting = false;
  protected boundaryDrag: BoundaryDragState | null = null;
  private _boundaryMoved = false;
  private readonly _boundaryMoveFn = (e: MouseEvent) => this._onBoundaryMouseMove(e);
  private readonly _boundaryUpFn = (e: MouseEvent) => this._onBoundaryMouseUp(e);
  private readonly _boundaryOverrides = new Map<string, number>();
  protected hoveredGroupId: string | null = null;
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['availabilityData']) this._boundaryOverrides.clear();
  }
  @HostListener('document:mouseup', ['$event'])
  protected onDocumentMouseUp(event: MouseEvent): void {
    if (this.boundaryDrag || !this.isDragging) return;
    this.isDragging = false;
    if (!this.dragDay || this.dragStartIdx < 0) return this._clearDrag();
    if (this.dragEndIdx < this.dragStartIdx)
      [this.dragStartIdx, this.dragEndIdx] = [this.dragEndIdx, this.dragStartIdx];
    this.hasSelection = true;
    this.didDrag = true;
    this.selectionComplete.emit({
      day: this.dragDay,
      startSlot: this.timeSlots[this.dragStartIdx],
      endSlot: this.timeSlots[this.dragEndIdx],
      x: event.clientX,
      y: event.clientY,
    });
  }
  protected onCellMouseDown(event: MouseEvent, day: Date, slot: TimeSlot): void {
    if (event.button !== 0 || !this._isCellFree(day, slot)) return;
    event.preventDefault();
    this._triggerDeselect();
    this.hasSelection = false;
    this.isDragging = true;
    this.didDrag = false;
    this.dragDay = day;
    const startIdx = this._slotIndex(slot);
    this.dragStartIdx = startIdx;
    this.dragEndIdx = startIdx;
    [this.dragMinIdx, this.dragMaxIdx] = this._calcDragBounds(day, startIdx);
  }
  protected onCellMouseEnter(day: Date, slot: TimeSlot): void {
    if (!this.isDragging || !this.dragDay || !isSameDay(day, this.dragDay)) return;
    const clamped = Math.max(this.dragMinIdx, Math.min(this.dragMaxIdx, this._slotIndex(slot)));
    if (clamped === this.dragEndIdx) return;
    this.dragEndIdx = clamped;
    if (clamped !== this.dragStartIdx) this.didDrag = true;
  }
  protected onCellContextMenu(event: MouseEvent, day: Date, slot: TimeSlot): void {
    if (!this.hasSelection || !this.dragDay || !isSameDay(day, this.dragDay)) return;
    if (!this.isCellInSelection(day, slot)) return;
    event.preventDefault();
    this.selectionComplete.emit({
      day: this.dragDay,
      startSlot: this.timeSlots[this.dragStartIdx],
      endSlot: this.timeSlots[this.dragEndIdx],
      x: event.clientX,
      y: event.clientY,
    });
  }
  private _calcDragBounds(day: Date, startIdx: number): [min: number, max: number] {
    let max = startIdx;
    for (let i = startIdx + 1; i < this.timeSlots.length; i++) {
      if (!this._isCellFree(day, this.timeSlots[i])) break;
      max = i;
    }
    let min = startIdx;
    for (let i = startIdx - 1; i >= 0; i--) {
      if (!this._isCellFree(day, this.timeSlots[i])) break;
      min = i;
    }
    return [min, max];
  }
  private _triggerDeselect(): void {
    if (!this.hasSelection) return;
    this.isDeselecting = true;
    requestAnimationFrame(() => requestAnimationFrame(() => { this.isDeselecting = false; }));
  }
  private _clearDrag(): void {
    this.dragDay = null;
    this.dragStartIdx = this.dragEndIdx = -1;
  }
  private _isCellFree(day: Date, slot: TimeSlot): boolean {
    if (!this.availabilityData) return true;
    if (this.cellService.isInPeriodOff(day)) return false;
    if (this.cellService.isDayOff(day)) return false;
    if (this.cellService.isCellFullyNonWorking(day, slot)) return false;
    if (this.cellService.isCellFullyInTimeBlock(day, slot)) return false;
    return this.cellService.getCellSegments(day, slot).every(s => s.type === 'free');
  }
  protected isCellInSelection(day: Date, slot: TimeSlot): boolean {
    if ((!this.isDragging && !this.hasSelection) || !this.dragDay) return false;
    if (!isSameDay(day, this.dragDay)) return false;
    const [s, e] = this._selectionRange();
    const idx = this._slotIndex(slot);
    return idx >= s && idx <= e;
  }
  protected isCellSelectionStart(day: Date, slot: TimeSlot): boolean {
    if ((!this.isDragging && !this.hasSelection) || !this.dragDay) return false;
    if (!isSameDay(day, this.dragDay)) return false;
    return this._slotIndex(slot) === this._selectionRange()[0];
  }
  protected isCellSelectionEnd(day: Date, slot: TimeSlot): boolean {
    if ((!this.isDragging && !this.hasSelection) || !this.dragDay) return false;
    if (!isSameDay(day, this.dragDay)) return false;
    return this._slotIndex(slot) === this._selectionRange()[1];
  }
  private _selectionRange(): [number, number] {
    return this.isDragging
      ? [Math.min(this.dragStartIdx, this.dragEndIdx), Math.max(this.dragStartIdx, this.dragEndIdx)]
      : [this.dragStartIdx, this.dragEndIdx];
  }
  protected onSlotClick(day: Date, slot: TimeSlot): void {
    if (this.didDrag) { this.didDrag = false; return; }
    this.slotClick.emit({ day, slot });
  }
  protected onDayHeaderClick(event: MouseEvent, day: Date): void {
    this.dayHeaderClick.emit({ day, x: event.clientX, y: event.clientY });
  }
  protected onSegmentClick(day: Date, seg: CellSegment): void {
    if (this.didDrag) { this.didDrag = false; return; }
    if (this.deleteMode) {
      if (seg.group && this._isTrackableType(seg)) {
        this.deleteEntity.emit(seg.group.id);
      }
      return;
    }
    if (seg.type !== 'free') return;
    this.slotClick.emit({ day, slot: this._segmentToSlot(seg) });
  }
  protected onSegmentEnter(event: MouseEvent, seg: CellSegment): void {
    if (this.isDragging || seg.type === 'non-working') return;
    this.hoveredGroupId = seg.group ? `${seg.group.kind}-${seg.group.id}` : null;
    if (seg.type !== 'free') {
      const data = this.cellService.getTooltipData(seg);
      if (data) this.tooltipSvc.schedule(event.clientX, event.clientY, data);
    }
  }
  protected onSegmentMove(event: MouseEvent, seg: CellSegment): void {
    if (this.isDragging || seg.type === 'non-working' || seg.type === 'free') return;
    this.tooltipSvc.resetTimer(event.clientX, event.clientY);
  }
  protected onSegmentLeave(): void {
    if (this.isDragging) return;
    this.hoveredGroupId = null;
    this.tooltipSvc.hide();
  }
  protected isSegmentHovered(seg: CellSegment): boolean {
    return !!this.hoveredGroupId && !!seg.group
      && `${seg.group.kind}-${seg.group.id}` === this.hoveredGroupId;
  }
  protected cellContinuesGroup(day: Date, slot: TimeSlot): boolean {
    const last = this.cellService.getCellSegments(day, slot).at(-1);
    return !!last?.group && !(last.isFragmentEnd ?? last.isGroupEnd);
  }
  public revertBoundaryChange(day: Date, type: 'start' | 'end'): void {
    this._boundaryOverrides.delete(this._boundaryKey(day, type));
  }
  protected isBoundaryDragging(day: Date, type: 'start' | 'end'): boolean {
    return !!this.boundaryDrag
      && this.boundaryDrag.type === type
      && isSameDay(day, this.boundaryDrag.day);
  }
  protected canShowBoundaryHandle(day: Date): boolean {
    return !!this.availabilityData && this.cellService.isWorkingDay(day);
  }
  protected getUpperBoundaryPct(day: Date, slot: TimeSlot): number | null {
    if (!this.canShowBoundaryHandle(day)) return null;
    return this._getBoundaryPct(day, slot, 'start');
  }
  protected getLowerBoundaryPct(day: Date, slot: TimeSlot): number | null {
    if (!this.canShowBoundaryHandle(day)) return null;
    return this._getBoundaryPct(day, slot, 'end');
  }
  private _getBoundaryPct(day: Date, slot: TimeSlot, type: 'start' | 'end'): number | null {
    if (this._boundaryMoved && this.boundaryDrag?.type === type && isSameDay(day, this.boundaryDrag.day)) {
      const s = this.timeSlots[this.boundaryDrag.currentSlotIndex];
      return (s?.hour === slot.hour && s?.minute === slot.minute)
        ? (type === 'start' ? 100 : 0)
        : null;
    }
    const overrideIdx = this._boundaryOverrides.get(this._boundaryKey(day, type));
    if (overrideIdx !== undefined) {
      const s = this.timeSlots[overrideIdx];
      return (s?.hour === slot.hour && s?.minute === slot.minute)
        ? (type === 'start' ? 100 : 0)
        : null;
    }
    const edge = type === 'start' ? 'isUpperBoundaryEdge' : 'isLowerBoundaryEdge';
    const seg = this.cellService.getCellSegments(day, slot).find(s => s[edge]);
    if (!seg) return null;
    return type === 'start' ? seg.endPct : seg.startPct;
  }
  protected onBoundaryMouseDown(event: MouseEvent, day: Date, type: 'start' | 'end'): void {
    event.preventDefault();
    event.stopPropagation();
    document.body.classList.add('cal-boundary-dragging');
    const cellEl = (event.currentTarget as HTMLElement).closest('.cal-grid__cell') as HTMLElement | null;
    if (!cellEl) return;
    const overrideIdx = this._boundaryOverrides.get(this._boundaryKey(day, type));
    const slotIndex = overrideIdx ?? this._findBoundarySlotIndex(day, type);
    if (slotIndex === -1) return;
    const pct = this._calcInitialBoundaryPct(day, slotIndex, type, overrideIdx);
    this._boundaryMoved = false;
    this.boundaryDrag = {
      type, day,
      originalSlotIndex: slotIndex,
      baseSlotIndex: slotIndex,
      currentSlotIndex: slotIndex,
      snapDone: pct === 0,
      initialOffsetPct: pct,
      startY: event.clientY,
      cellHeightPx: cellEl.getBoundingClientRect().height,
    };
    document.addEventListener('mousemove', this._boundaryMoveFn);
    document.addEventListener('mouseup', this._boundaryUpFn, { once: true });
  }
  private _calcInitialBoundaryPct(
    day: Date, slotIndex: number, type: 'start' | 'end', overrideIdx: number | undefined,
  ): number {
    if (overrideIdx !== undefined) return type === 'start' ? 100 : 0;
    const segs = this.cellService.getCellSegments(day, this.timeSlots[slotIndex]);
    return type === 'start'
      ? (segs.find(s => s.isUpperBoundaryEdge)?.endPct ?? 0)
      : (segs.find(s => s.isLowerBoundaryEdge)?.startPct ?? 0);
  }
  private _onBoundaryMouseMove(event: MouseEvent): void {
    const drag = this.boundaryDrag;
    if (!drag) return;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaY) < 3 && !this._boundaryMoved) return;
    if (!drag.snapDone) {
      drag.baseSlotIndex = this._calcSnapBase(drag, deltaY < 0);
      drag.currentSlotIndex = drag.baseSlotIndex;
      drag.snapDone = true;
      drag.startY = event.clientY;
      this._boundaryMoved = true;
      return;
    }
    const slotDelta = this._deltaToSlots(deltaY, drag.cellHeightPx);
    const targetIdx = Math.max(0, Math.min(this.timeSlots.length - 1, drag.baseSlotIndex + slotDelta));
    const validIdx = this._findLastValidBoundaryIndex(drag.day, drag.type, drag.baseSlotIndex, targetIdx);
    const blocked = validIdx === drag.currentSlotIndex && targetIdx !== validIdx && slotDelta !== 0;
    document.body.classList.toggle('cal-boundary-dragging-blocked', blocked);
    if (validIdx !== drag.currentSlotIndex) {
      drag.currentSlotIndex = validIdx;
      this._boundaryMoved = true;
    }
  }
  private _calcSnapBase(drag: BoundaryDragState, movingUp: boolean): number {
    const isPartial = drag.initialOffsetPct > 0 && drag.initialOffsetPct < 100;
    if (drag.type === 'start') {
      return (isPartial && movingUp)
        ? Math.max(0, drag.originalSlotIndex - 1)
        : drag.originalSlotIndex;
    }
    if (isPartial) {
      const candidate = drag.originalSlotIndex + (movingUp ? 0 : 1);
      return this.timeSlots[candidate] ? candidate : drag.originalSlotIndex;
    }
    const candidate = movingUp ? drag.originalSlotIndex : drag.originalSlotIndex + 1;
    return this.timeSlots[candidate] ? candidate : drag.originalSlotIndex;
  }
  private _onBoundaryMouseUp(_event: MouseEvent): void {
    document.removeEventListener('mousemove', this._boundaryMoveFn);
    document.body.classList.remove('cal-boundary-dragging', 'cal-boundary-dragging-blocked');
    const drag = this.boundaryDrag;
    this.boundaryDrag = null;
    if (!drag || !this._boundaryMoved) return;
    this._boundaryOverrides.set(this._boundaryKey(drag.day, drag.type), drag.currentSlotIndex);
    this.boundaryChange.emit({
      day: drag.day,
      type: drag.type,
      newSlot: this.timeSlots[drag.currentSlotIndex],
      originalSlot: this.timeSlots[drag.originalSlotIndex],
    });
  }
  private _findLastValidBoundaryIndex(
    day: Date, type: 'start' | 'end', baseIdx: number, targetIdx: number,
  ): number {
    if (targetIdx === baseIdx) return baseIdx;
    const dir = targetIdx > baseIdx ? 1 : -1;
    let lastValid = baseIdx;
    const counterIdx = this._getCounterpartSlotIndex(day, type);
    for (let i = baseIdx + dir; dir > 0 ? i <= targetIdx : i >= targetIdx; i += dir) {
      if (!this.timeSlots[i]) break;
      if (type === 'start' && counterIdx !== -1 && i >= counterIdx - MIN_BOUNDARY_GAP) break;
      if (type === 'end' && counterIdx !== -1 && i <= counterIdx + MIN_BOUNDARY_GAP) break;
      lastValid = i;
    }
    return lastValid;
  }
  private _getCounterpartSlotIndex(day: Date, type: 'start' | 'end'): number {
    const counterType = type === 'start' ? 'end' : 'start';
    return this._boundaryOverrides.get(this._boundaryKey(day, counterType))
      ?? this._findBoundarySlotIndex(day, counterType);
  }
  private _findBoundarySlotIndex(day: Date, type: 'start' | 'end'): number {
    const edge = type === 'start' ? 'isUpperBoundaryEdge' : 'isLowerBoundaryEdge';
    return this.timeSlots.findIndex(slot =>
      this.cellService.getCellSegments(day, slot).some(s => s[edge])
    );
  }
  protected getShStartKey(day: Date, seg: CellSegment): string | null {
    if (!this._isTrackableType(seg) || !seg.group) return null;
    const { kind, id, fragmentId } = seg.group;
    const dk = format(day, 'yyyy-MM-dd');
    if (fragmentId !== undefined) {
      return seg.isFragmentStart ? `${kind}|${id}|${fragmentId}|${dk}` : null;
    }
    return seg.isGroupStart ? `${kind}|${id}|${dk}` : null;
  }
  protected getShEndKey(day: Date, seg: CellSegment): string | null {
    if (!this._isTrackableType(seg) || !seg.group) return null;
    const { kind, id, fragmentId } = seg.group;
    const dk = format(day, 'yyyy-MM-dd');
    if (fragmentId !== undefined) {
      return (seg.isFragmentEnd && !seg.isFragmentStart) ? `${kind}|${id}|${fragmentId}|${dk}` : null;
    }
    return (seg.isGroupEnd && !seg.isGroupStart) ? `${kind}|${id}|${dk}` : null;
  }
  protected formatDate(day: Date): string { return format(day, 'yyyy-MM-dd'); }
  private _isTrackableType(seg: CellSegment): boolean {
    return seg.type === 'timeoff' || seg.type === 'periodoff' || seg.type === 'dayoff';
  }
  protected isDayToday(day: Date): boolean { return isToday(day); }
  protected isSelectedDay(day: Date): boolean { return isSameDay(day, this.currentDate); }
  protected formatDayNumber(day: Date): string { return format(day, 'd'); }
  protected formatDayName(day: Date): string { return format(day, 'EEE', { locale: es }); }
  protected trackByDay(_: number, day: Date): string { return day.toISOString(); }
  protected trackBySlot(_: number, s: TimeSlot): string { return `${s.hour}:${s.minute}`; }
  private _slotIndex(slot: TimeSlot): number {
    return this.timeSlots.findIndex(s => s.hour === slot.hour && s.minute === slot.minute);
  }
  private _deltaToSlots(deltaY: number, cellHeight: number): number {
    const raw = deltaY / cellHeight;
    return raw < 0 ? -Math.floor(Math.abs(raw)) : Math.floor(raw);
  }
  private _segmentToSlot(seg: CellSegment): TimeSlot {
    const hour = Math.floor(seg.startMin / 60);
    const minute = seg.startMin % 60;
    return { hour, minute, label: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` };
  }
  private _boundaryKey(day: Date, type: 'start' | 'end'): string {
    return `${format(day, 'yyyy-MM-dd')}-${type}`;
  }
}
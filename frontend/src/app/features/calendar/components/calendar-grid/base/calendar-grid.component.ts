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
const MIN_BOUNDARY_GAP = 1;
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
  private readonly _boundaryTouchMoveFn = (e: TouchEvent) => this._onBoundaryTouchMove(e);
  private readonly _boundaryTouchUpFn = (e: TouchEvent) => this._onBoundaryTouchUp(e);
  private readonly _boundaryMoveFn = (e: MouseEvent) => this._onBoundaryMouseMove(e);
  private readonly _boundaryUpFn = (e: MouseEvent) => this._onBoundaryMouseUp(e);
  private readonly _boundaryPointerMoveFn = (e: PointerEvent) => this._onBoundaryPointerMove(e);
  private readonly _boundaryPointerUpFn = (e: PointerEvent) => this._onBoundaryPointerUp(e);
  private readonly _boundaryOverrides = new Map<string, number>();
  private _touchStartX = 0;
  private _touchStartY = 0;
  private _touchDecided = false;
  private _touchIsSelecting = false;
  private readonly _touchMoveFn = (e: TouchEvent) => this._onSelectionTouchMove(e);
  private readonly _touchEndFn = (e: TouchEvent) => this._onSelectionTouchEnd(e);
  private readonly _boundaryTouchEndFn = (e: TouchEvent) => this._onBoundaryTouchEnd(e);
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
      this.tooltipSvc.hide();
      this.hoveredGroupId = null;
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
    if (this.deleteMode && this._isTouchDevice()) return;
    this.hoveredGroupId = seg.group ? `${seg.group.kind}-${seg.group.id}` : null;
    if (seg.type !== 'free') {
      const data = this.cellService.getTooltipData(seg);
      if (data) this.tooltipSvc.schedule(event.clientX, event.clientY, data);
    }
  }
  protected onSegmentMove(event: MouseEvent, seg: CellSegment): void {
    if (this.isDragging || seg.type === 'non-working' || seg.type === 'free') return;
    if (this.deleteMode && this._isTouchDevice()) return;
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
  protected onBoundaryPointerDown(event: PointerEvent, day: Date, type: 'start' | 'end'): void {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    document.body.classList.add('cal-boundary-dragging');

    const handleEl = event.currentTarget as HTMLElement | null;
    const cellEl = handleEl?.closest('.cal-grid__cell') as HTMLElement | null;
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
      pointerId: event.pointerId,
      pointerCaptureEl: handleEl ?? undefined,
    };

    handleEl?.setPointerCapture(event.pointerId);
    document.addEventListener('pointermove', this._boundaryPointerMoveFn);
    document.addEventListener('pointerup', this._boundaryPointerUpFn, { once: true });
    document.addEventListener('pointercancel', this._boundaryPointerUpFn, { once: true });
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
    this._processBoundaryMove(event.clientY);
  }
  private _onBoundaryPointerMove(event: PointerEvent): void {
    if (!this.boundaryDrag || this.boundaryDrag.pointerId !== event.pointerId) return;
    event.preventDefault();
    this._processBoundaryMove(event.clientY);
  }

  private _processBoundaryMove(clientY: number): void {
    const drag = this.boundaryDrag;
    if (!drag) return;

    let deltaY = clientY - drag.startY;
    if (Math.abs(deltaY) < 3 && !this._boundaryMoved) return;

    if (!drag.snapDone) {
      const movingUp = deltaY < 0;
      const isPartial = drag.initialOffsetPct > 0 && drag.initialOffsetPct < 100;
      let newBase: number;

      if (drag.type === 'start') {
        newBase = (isPartial && movingUp)
          ? Math.max(0, drag.originalSlotIndex - 1)
          : drag.originalSlotIndex;
      } else {
        if (isPartial) {
          newBase = !movingUp && this.timeSlots[drag.originalSlotIndex + 1]
            ? drag.originalSlotIndex + 1
            : drag.originalSlotIndex;
        } else {
          newBase = movingUp ? drag.originalSlotIndex : drag.originalSlotIndex + 1;
          if (newBase !== drag.originalSlotIndex && !this.timeSlots[newBase]) {
            newBase = drag.originalSlotIndex;
          }
        }
      }

      drag.baseSlotIndex = newBase;
      drag.currentSlotIndex = newBase;
      drag.snapDone = true;
      this._boundaryMoved = true;

      if (isPartial) {
        const offsetPx = (drag.initialOffsetPct / 100) * drag.cellHeightPx;
        const snapDistance = movingUp ? offsetPx : (drag.cellHeightPx - offsetPx);
        const signedSnapDistance = movingUp ? -snapDistance : snapDistance;
        const deltaAfterSnap = deltaY - signedSnapDistance;

        if (movingUp && deltaAfterSnap > 0) deltaY = 0;
        else if (!movingUp && deltaAfterSnap < 0) deltaY = 0;
        else deltaY = deltaAfterSnap;
      }

      drag.startY = clientY;        // ← resetea desde la posición actual
    }

    const rawDelta = deltaY / drag.cellHeightPx;
    const slotDelta = rawDelta < 0 ? -Math.floor(Math.abs(rawDelta)) : Math.floor(rawDelta);
    const baseIdx = drag.currentSlotIndex;
    const targetIdx = Math.max(0, Math.min(this.timeSlots.length - 1, baseIdx + slotDelta));
    const validIdx = this._findLastValidBoundaryIndex(drag.day, drag.type, baseIdx, targetIdx);

    const isBlocked = validIdx === baseIdx && targetIdx !== baseIdx && slotDelta !== 0;
    document.body.classList.toggle('cal-boundary-dragging-blocked', isBlocked);

    if (slotDelta !== 0) {
      if (validIdx !== baseIdx) {
        drag.currentSlotIndex = validIdx;
        this._boundaryMoved = true;
      }
      drag.baseSlotIndex = drag.currentSlotIndex;
      drag.startY = clientY;
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
  private _onBoundaryPointerUp(event: PointerEvent): void {
    if (!this.boundaryDrag || this.boundaryDrag.pointerId !== event.pointerId) return;
    document.removeEventListener('pointermove', this._boundaryPointerMoveFn);
    document.removeEventListener('pointerup', this._boundaryPointerUpFn);
    document.removeEventListener('pointercancel', this._boundaryPointerUpFn);
    document.body.classList.remove('cal-boundary-dragging', 'cal-boundary-dragging-blocked');

    const drag = this.boundaryDrag;
    this.boundaryDrag = null;

    if (drag.pointerCaptureEl?.hasPointerCapture(event.pointerId)) {
      drag.pointerCaptureEl.releasePointerCapture(event.pointerId);
    }

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
  private _canStartTouchSelection(event: TouchEvent, day: Date, slot: TimeSlot): boolean {
    return event.touches.length === 1 && this._isCellFree(day, slot);
  }
  private _startTouchSelection(touch: Touch, day: Date, slot: TimeSlot): void {
    this._touchStartX = touch.clientX;
    this._touchStartY = touch.clientY;
    this._touchDecided = false;
    this._touchIsSelecting = false;

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
  private _attachSelectionTouchListeners(): void {
    document.addEventListener('touchmove', this._touchMoveFn, { passive: false });
    document.addEventListener('touchend', this._touchEndFn, { once: true });
    document.addEventListener('touchcancel', this._touchEndFn, { once: true });
  }
  private _detachSelectionTouchListeners(): void {
    document.removeEventListener('touchmove', this._touchMoveFn);
    document.removeEventListener('touchend', this._touchEndFn);
    document.removeEventListener('touchcancel', this._touchEndFn);
  }
  private _getSingleTouch(event: TouchEvent): Touch | null {
    return event.touches.length === 1 ? event.touches[0] : null;
  }
  private _isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia?.('(hover: none) and (pointer: coarse)')?.matches) return true;
    return typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;
  }
  private _getPrimaryTouch(event: TouchEvent): Touch | null {
    return event.touches.length ? event.touches[0] : null;
  }
  private _decideSelectionGesture(touch: Touch): boolean {
    if (this._touchDecided) return this._touchIsSelecting;

    const dx = Math.abs(touch.clientX - this._touchStartX);
    const dy = Math.abs(touch.clientY - this._touchStartY);
    if (dx < 6 && dy < 6) return false;

    this._touchDecided = true;
    this._touchIsSelecting = dy > dx;

    if (!this._touchIsSelecting) {
      this._cancelSelectionGesture();
      return false;
    }

    return true;
  }
  private _cancelSelectionGesture(): void {
    this.isDragging = false;
    this._detachSelectionTouchListeners();
  }
  private _updateSelectionFromTouch(touch: Touch): void {
    const info = this._findCellInfoFromPoint(touch.clientX, touch.clientY);
    if (!info || !this.dragDay) return;
    if (format(info.day, 'yyyy-MM-dd') !== format(this.dragDay, 'yyyy-MM-dd')) return;

    const clamped = Math.max(this.dragMinIdx, Math.min(this.dragMaxIdx, info.slotIdx));
    if (clamped !== this.dragEndIdx) {
      this.dragEndIdx = clamped;
      if (clamped !== this.dragStartIdx) this.didDrag = true;
    }
  }
  private _normalizeSelectionRange(): void {
    if (this.dragEndIdx < this.dragStartIdx)
      [this.dragStartIdx, this.dragEndIdx] = [this.dragEndIdx, this.dragStartIdx];
  }
  private _finalizeSelectionFromTouch(touch: Touch | null): void {
    if (!this.dragDay || this.dragStartIdx < 0) { this._clearDrag(); return; }
    this._normalizeSelectionRange();

    this.hasSelection = true;
    this.didDrag = true;

    this.selectionComplete.emit({
      day: this.dragDay,
      startSlot: this.timeSlots[this.dragStartIdx],
      endSlot: this.timeSlots[this.dragEndIdx],
      x: touch?.clientX ?? 0,
      y: touch?.clientY ?? 0,
    });
  }
  private _getBoundarySlotInfo(
    day: Date, type: 'start' | 'end',
  ): { slotIndex: number; overrideIdx: number | undefined } | null {
    const overrideIdx = this._boundaryOverrides.get(this._boundaryKey(day, type));
    const slotIndex = overrideIdx ?? this._findBoundarySlotIndex(day, type);
    if (slotIndex === -1) return null;
    return { slotIndex, overrideIdx };
  }
  private _getBoundaryCellFromTarget(target: EventTarget | null): HTMLElement | null {
    return (target as HTMLElement | null)?.closest('.cal-grid__cell') as HTMLElement | null;
  }
  private _startBoundaryTouchDrag(
    target: EventTarget | null,
    day: Date,
    type: 'start' | 'end',
    clientY: number,
  ): void {
    document.body.classList.add('cal-boundary-dragging');

    const cellEl = this._getBoundaryCellFromTarget(target);
    if (!cellEl) return;

    const slotInfo = this._getBoundarySlotInfo(day, type);
    if (!slotInfo) return;

    const pct = this._calcInitialBoundaryPct(day, slotInfo.slotIndex, type, slotInfo.overrideIdx);
    this._boundaryMoved = false;
    this.boundaryDrag = {
      type,
      day,
      originalSlotIndex: slotInfo.slotIndex,
      baseSlotIndex: slotInfo.slotIndex,
      currentSlotIndex: slotInfo.slotIndex,
      snapDone: pct === 0,
      initialOffsetPct: pct,
      startY: clientY,
      cellHeightPx: cellEl.getBoundingClientRect().height,
    };

    this._attachBoundaryTouchListeners();
  }
  private _attachBoundaryTouchListeners(): void {
    document.addEventListener('touchmove', this._boundaryTouchMoveFn, { passive: false });
    document.addEventListener('touchend', this._boundaryTouchUpFn, { once: true });
    document.addEventListener('touchcancel', this._boundaryTouchUpFn, { once: true });
  }
  private _detachBoundaryTouchListeners(removeEnd = true): void {
    document.removeEventListener('touchmove', this._boundaryTouchMoveFn);
    if (!removeEnd) return;
    document.removeEventListener('touchend', this._boundaryTouchUpFn);
    document.removeEventListener('touchcancel', this._boundaryTouchUpFn);
  }
  private _clearBoundaryDragStyles(): void {
    document.body.classList.remove('cal-boundary-dragging');
    document.body.classList.remove('cal-boundary-dragging-blocked');
  }
  private _finalizeBoundaryTouchDrag(): void {
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
  protected onCellTouchStart(event: TouchEvent, day: Date, slot: TimeSlot): void {
    if (!this._canStartTouchSelection(event, day, slot)) return;
    const touch = event.touches[0];
    this._startTouchSelection(touch, day, slot);
    this._attachSelectionTouchListeners();
  }

  private _onSelectionTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;
    const touch = this._getSingleTouch(event);
    if (!touch) return;
    if (!this._decideSelectionGesture(touch)) return;

    event.preventDefault();
    this._updateSelectionFromTouch(touch);
  }

  private _onSelectionTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this._detachSelectionTouchListeners();
    if (!this.isDragging) return;
    this.isDragging = false;

    const t = event.changedTouches[0] ?? null;
    this._finalizeSelectionFromTouch(t);
  }

  protected onBoundaryTouchStart(event: TouchEvent, day: Date, type: 'start' | 'end'): void {
    const touch = this._getSingleTouch(event);
    if (!touch) return;
    event.preventDefault();
    event.stopPropagation();
    this._startBoundaryTouchDrag(event.currentTarget, day, type, touch.clientY);
  }

  private _onBoundaryTouchMove(event: TouchEvent): void {
    const touch = this._getPrimaryTouch(event);
    if (!touch) return;
    event.preventDefault();
    this._processBoundaryMove(touch.clientY);
  }

  private _onBoundaryTouchEnd(_event: TouchEvent): void {
    this._detachBoundaryTouchListeners(false);
    this._clearBoundaryDragStyles();
    this._finalizeBoundaryTouchDrag();
  }

  private _findCellInfoFromPoint(x: number, y: number): { day: Date; slotIdx: number } | null {
    const cell = document.elementFromPoint(x, y)
      ?.closest<HTMLElement>('.cal-grid__cell');
    if (!cell) return null;

    const hour = parseInt(cell.dataset['slotHour'] ?? '');
    const minute = parseInt(cell.dataset['slotMinute'] ?? '');
    const dayStr = cell.dataset['day'];
    if (isNaN(hour) || isNaN(minute) || !dayStr) return null;

    const slotIdx = this.timeSlots.findIndex(s => s.hour === hour && s.minute === minute);
    if (slotIdx === -1) return null;

    const [yr, mo, da] = dayStr.split('-').map(Number);
    return { day: new Date(yr, mo - 1, da, 12, 0, 0), slotIdx };
  }
  private _onBoundaryTouchUp(_event: TouchEvent): void {
    this._detachBoundaryTouchListeners();
    this._clearBoundaryDragStyles();
    this._finalizeBoundaryTouchDrag();
  }
}
import { Injectable } from '@angular/core';
import { format, getDay } from 'date-fns';
import type { TimeSlot } from '../interfaces/time-slot.interface';
import type {
  AvailabilityConfigData,
  WorkingHour,
} from '../models/responses/availability-response.model';
import { CellSegment } from '../interfaces/cell-segment.interface';
import { TooltipData } from '../interfaces/tooltip.interface';
import { AvailabilityHierarchyAdapter } from '../adapters/availability-hierachy.adapter';
import { ResolvedTimeBlock } from '../interfaces/availability.interface';
import { DAY_INDEX_TO_WEEKDAY } from '../constants/availability.constants';
import { timeStringToMinutes } from '../utils/time.util';
import { DEFAULT_REASONS } from '../constants/availability-reasons.constants';


type WorkingRange = { startMin: number; endMin: number };
type TimeBlockEntry = { s: number; e: number; reason?: string };


@Injectable()
export class CalendarCellService {

  private availabilityData: AvailabilityConfigData | null = null;

  private workingHoursMap = new Map<string, WorkingRange>();
  private boundaryStyleCache = new Map<string, { [key: string]: string } | null>();
  private segmentsCache = new Map<string, CellSegment[]>();
  private resolvedBlocksCache = new Map<string, ResolvedTimeBlock[]>();

  private gridStartMin = 0;
  private gridEndMin = 1440;

  public constructor(private readonly adapter: AvailabilityHierarchyAdapter) { }


  public configure(data: AvailabilityConfigData | null, timeSlots?: TimeSlot[]): void {
    this.availabilityData = data;

    if (timeSlots?.length) {
      this.gridStartMin = timeSlots[0].hour * 60 + timeSlots[0].minute;
      const last = timeSlots[timeSlots.length - 1];
      this.gridEndMin = last.hour * 60 + last.minute + 30;
    }

    this.buildWorkingHoursMap(data?.workingHours ?? []);
  }

  private buildWorkingHoursMap(workingHours: WorkingHour[]): void {
    this.workingHoursMap.clear();
    this.boundaryStyleCache.clear();
    this.segmentsCache.clear();
    this.resolvedBlocksCache.clear();

    for (const wh of workingHours) {
      this.workingHoursMap.set(wh.weekday, {
        startMin: timeStringToMinutes(wh.start),
        endMin: timeStringToMinutes(wh.end),
      });
    }
  }


  public isDayOff(day: Date): boolean {
    return !!this.findDayOffEntry(day);
  }

  public isInPeriodOff(day: Date): boolean {
    if (!this.availabilityData?.periodsOff?.length) return false;
    return !!this.findPeriodOffEntry(day);
  }

  public isWorkingDay(day: Date): boolean {
    if (!this.availabilityData) return true;
    return this.workingHoursMap.has(DAY_INDEX_TO_WEEKDAY[getDay(day)]);
  }

  public getDayOffReason(day: Date): string | null {
    if (!this.availabilityData?.daysOff?.length) return null;
    const entry = this.findDayOffEntry(day);
    return entry ? (entry.reason?.trim() || DEFAULT_REASONS.dayoff) : null;
  }

  public getPeriodOffReason(day: Date): string | null {
    const entry = this.findPeriodOffEntry(day);
    return entry ? (entry.reason?.trim() || DEFAULT_REASONS.periodoff) : null;
  }

  public getMonthDayGroup(day: Date): { kind: 'periodoff' | 'dayoff'; id: number } | null {
    const periodOff = this.availabilityData?.periodsOff?.length
      ? this.findPeriodOffEntry(day)
      : undefined;
    if (periodOff) return { kind: 'periodoff', id: periodOff.id };

    const dayOff = this.findDayOffEntry(day);
    if (dayOff) return { kind: 'dayoff', id: dayOff.id };

    return null;
  }


  public isCellFullyNonWorking(day: Date, slot: TimeSlot): boolean {
    if (!this.availabilityData) return false;
    const range = this.workingHoursMap.get(DAY_INDEX_TO_WEEKDAY[getDay(day)]);
    if (!range) return true;
    const slotStart = slot.hour * 60 + slot.minute;
    const slotEnd = slotStart + 30;
    return slotEnd <= range.startMin || slotStart >= range.endMin;
  }

  public isCellInTimeBlock(day: Date, slot: TimeSlot): boolean {
    const slotStart = slot.hour * 60 + slot.minute;
    const slotEnd = slotStart + 30;
    return this.collectTimeBlockEntries(day).some(r => slotStart < r.e && slotEnd > r.s);
  }

  public isCellFullyInTimeBlock(day: Date, slot: TimeSlot): boolean {
    const slotStart = slot.hour * 60 + slot.minute;
    const slotEnd = slotStart + 30;
    return this.collectTimeBlockEntries(day).some(r => r.s <= slotStart && r.e >= slotEnd);
  }

  public getTimeBlockReason(day: Date, slot: TimeSlot): string | null {
    if (this.isCellSplit(day, slot)) return null;
    const matches = this.getMatchingTimeBlockEntries(day, slot);
    if (matches.length !== 1) return null;
    return matches[0].reason ?? DEFAULT_REASONS.timeoff;
  }

  public getTimeBlockTitle(day: Date, slot: TimeSlot): string {
    return this.getMatchingTimeBlockEntries(day, slot)
      .map(b => b.reason ?? DEFAULT_REASONS.timeoff)
      .join('\n');
  }


  public getCellSegments(day: Date, slot: TimeSlot): CellSegment[] {
    const key = this.segmentCacheKey(day, slot);
    if (this.segmentsCache.has(key)) return this.segmentsCache.get(key)!;
    const result = this.computeSegments(day, slot);
    this.segmentsCache.set(key, result);
    return result;
  }

  private computeSegments(day: Date, slot: TimeSlot): CellSegment[] {
    const slotStart = slot.hour * 60 + slot.minute;
    const slotEnd = slotStart + 30;

    const periodOff = this.availabilityData?.periodsOff?.length
      ? this.findPeriodOffEntry(day)
      : undefined;
    if (periodOff) return this.buildPeriodOffSegments(slotStart, slotEnd, periodOff);

    const dayOff = this.findDayOffEntry(day);
    if (dayOff) return this.buildDayOffSegments(slotStart, slotEnd, dayOff);

    const range = this.workingHoursMap.get(DAY_INDEX_TO_WEEKDAY[getDay(day)]);
    if (!range) {
      return [{ startPct: 0, endPct: 100, startMin: slotStart, endMin: slotEnd, type: 'non-working' }];
    }

    return this.buildWorkingSegments(day, slotStart, slotEnd, range);
  }

  private buildPeriodOffSegments(
    slotStart: number,
    slotEnd: number,
    entry: NonNullable<ReturnType<typeof this.findPeriodOffEntry>>,
  ): CellSegment[] {
    return [{
      startPct: 0, endPct: 100, startMin: slotStart, endMin: slotEnd,
      type: 'periodoff',
      reason: entry.reason?.trim() || DEFAULT_REASONS.periodoff,
      group: { kind: 'periodoff', id: entry.id },
      isGroupStart: slotStart === this.gridStartMin,
      isGroupEnd: slotEnd === this.gridEndMin,
    }];
  }

  private buildDayOffSegments(
    slotStart: number,
    slotEnd: number,
    entry: NonNullable<ReturnType<typeof this.findDayOffEntry>>,
  ): CellSegment[] {
    return [{
      startPct: 0, endPct: 100, startMin: slotStart, endMin: slotEnd,
      type: 'dayoff',
      reason: entry.reason?.trim() || DEFAULT_REASONS.dayoff,
      group: { kind: 'dayoff', id: entry.id },
      isGroupStart: slotStart === this.gridStartMin,
      isGroupEnd: slotEnd === this.gridEndMin,
    }];
  }

  private buildWorkingSegments(
    day: Date,
    slotStart: number,
    slotEnd: number,
    range: WorkingRange,
  ): CellSegment[] {
    const resolvedBlocks = this.getResolvedBlocksForDay(day);
    const relevantBlocks = resolvedBlocks.filter(b => b.startMin < slotEnd && b.endMin > slotStart);
    const cutPoints = this.collectCutPoints(slotStart, slotEnd, range, relevantBlocks);

    return cutPoints.slice(0, -1).map((from, i) =>
      this.classifySubInterval(from, cutPoints[i + 1], slotStart, range, relevantBlocks)
    );
  }

  private collectCutPoints(
    slotStart: number,
    slotEnd: number,
    range: WorkingRange,
    blocks: ResolvedTimeBlock[],
  ): number[] {
    const pts = new Set<number>([slotStart, slotEnd]);

    if (range.startMin > slotStart && range.startMin < slotEnd) pts.add(range.startMin);
    if (range.endMin > slotStart && range.endMin < slotEnd) pts.add(range.endMin);

    for (const b of blocks) {
      if (b.startMin > slotStart && b.startMin < slotEnd) pts.add(b.startMin);
      if (b.endMin > slotStart && b.endMin < slotEnd) pts.add(b.endMin);
    }

    return Array.from(pts).sort((a, b) => a - b);
  }

  private classifySubInterval(
    from: number,
    to: number,
    slotStart: number,
    range: WorkingRange,
    blocks: ResolvedTimeBlock[],
  ): CellSegment {
    const mid = (from + to) / 2;
    const startPct = Math.round(((from - slotStart) / 30) * 100);
    const endPct = Math.round(((to - slotStart) / 30) * 100);

    if (mid < range.startMin || mid >= range.endMin) {
      return {
        startPct, endPct, startMin: from, endMin: to,
        type: 'non-working',
        isUpperBoundaryEdge: to === range.startMin,
        isLowerBoundaryEdge: from === range.endMin,
      };
    }

    const block = blocks.find(b => b.startMin <= mid && b.endMin > mid);
    if (block) {
      return {
        startPct, endPct, startMin: from, endMin: to,
        type: 'timeoff',
        reason: block.reason?.trim() || DEFAULT_REASONS.timeoff,
        blockStartMin: block.startMin,
        blockEndMin: block.endMin,
        group: { kind: 'timeoff', id: block.groupId },
        isGroupStart: from === block.startMin && block.isGroupStart,
        isGroupEnd: to === block.endMin && block.isGroupEnd,
        isFragmentStart: from === block.startMin,
        isFragmentEnd: to === block.endMin,
      };
    }

    return { startPct, endPct, startMin: from, endMin: to, type: 'free' };
  }


  public getTooltipDataForGroup(group: { kind: 'periodoff' | 'dayoff' | 'timeoff'; id: number }): TooltipData | null {
    return this.getTooltipData({ group } as CellSegment);
  }

  public getTooltipData(seg: CellSegment): TooltipData | null {
    if (!seg.group) return null;
    const { kind, id } = seg.group;
    switch (kind) {
      case 'timeoff':   return this.tooltipForTimeoff(id);
      case 'periodoff': return this.tooltipForPeriodoff(id);
      case 'dayoff':    return this.tooltipForDayoff(id);
      default:          return null;
    }
  }

  private tooltipForTimeoff(id: number): TooltipData | null {
    const block = [
      ...(this.availabilityData?.timesOff?.recurring ?? []),
      ...(this.availabilityData?.timesOff?.specific ?? []),
    ].find(t => t.id === id);
    if (!block) return null;
    return {
      type: 'timeoff',
      reason: block.reason?.trim() || DEFAULT_REASONS.timeoff,
      startTime: block.start,
      endTime: block.end,
    };
  }

  private tooltipForPeriodoff(id: number): TooltipData | null {
    const entry = this.availabilityData?.periodsOff?.find(p => p.id === id);
    if (!entry) return null;
    return {
      type: 'periodoff',
      reason: entry.reason?.trim() || DEFAULT_REASONS.periodoff,
      startDate: entry.startDate,
      endDate: entry.endDate,
    };
  }

  private tooltipForDayoff(id: number): TooltipData | null {
    const entry = this.availabilityData?.daysOff?.find(d => d.id === id);
    if (!entry) return null;
    return {
      type: 'dayoff',
      reason: entry.reason?.trim() || DEFAULT_REASONS.dayoff,
      date: entry.date,
    };
  }

  private findPeriodOffEntry(day: Date) {
    const ref = new Date(day);
    ref.setHours(12, 0, 0, 0);
    return this.availabilityData?.periodsOff?.find(v =>
      ref >= new Date(v.startDate + 'T00:00:00') &&
      ref <= new Date(v.endDate + 'T23:59:59')
    );
  }

  private findDayOffEntry(day: Date) {
    const dateStr = format(day, 'yyyy-MM-dd');
    return this.availabilityData?.daysOff?.find(d => d.date === dateStr);
  }

  private collectTimeBlockEntries(day: Date): TimeBlockEntry[] {
    const timesOff = this.availabilityData?.timesOff;
    if (!timesOff) return [];
    const weekday = DAY_INDEX_TO_WEEKDAY[getDay(day)];
    const dateStr = format(day, 'yyyy-MM-dd');
    return [
      ...(timesOff.recurring ?? []).filter(t => t.weekday === weekday),
      ...(timesOff.specific ?? []).filter(t => t.date === dateStr),
    ].map(t => ({ s: timeStringToMinutes(t.start), e: timeStringToMinutes(t.end), reason: t.reason }));
  }

  private getMatchingTimeBlockEntries(day: Date, slot: TimeSlot): TimeBlockEntry[] {
    const slotStart = slot.hour * 60 + slot.minute;
    const slotEnd = slotStart + 30;
    return this.collectTimeBlockEntries(day).filter(r => slotStart < r.e && slotEnd > r.s);
  }

  private getResolvedBlocksForDay(day: Date): ResolvedTimeBlock[] {
    const dayKey = this.dayCacheKey(day);
    if (this.resolvedBlocksCache.has(dayKey)) return this.resolvedBlocksCache.get(dayKey)!;

    const weekday = DAY_INDEX_TO_WEEKDAY[getDay(day)];
    const timesOff = this.availabilityData?.timesOff;
    const range = this.workingHoursMap.get(weekday);

    const specifics = (timesOff?.specific ?? [])
      .filter(t => t.date === dayKey)
      .map(t => ({ id: t.id, startMin: timeStringToMinutes(t.start), endMin: timeStringToMinutes(t.end), reason: t.reason, kind: 'specific' as const }));

    const recurrings = (timesOff?.recurring ?? [])
      .filter(t => t.weekday === weekday)
      .map(t => ({ id: t.id, startMin: timeStringToMinutes(t.start), endMin: timeStringToMinutes(t.end), reason: t.reason, kind: 'recurring' as const }));

    const result = this.adapter.resolveTimeBlocks(
      specifics,
      recurrings,
      range?.startMin ?? this.gridStartMin,
      range?.endMin ?? this.gridEndMin,
    );
    this.resolvedBlocksCache.set(dayKey, result);
    return result;
  }

  private isCellSplit(day: Date, slot: TimeSlot): boolean {
    const range = this.workingHoursMap.get(DAY_INDEX_TO_WEEKDAY[getDay(day)]);
    if (!range) return false;
    const slotStart = slot.hour * 60 + slot.minute;
    const slotEnd = slotStart + 30;
    return (
      (range.startMin > slotStart && range.startMin < slotEnd) ||
      (range.endMin > slotStart && range.endMin < slotEnd)
    );
  }

  private segmentCacheKey(day: Date, slot: TimeSlot): string {
    return `seg-${day.toDateString()}-${slot.hour}-${slot.minute}`;
  }

  private dayCacheKey(day: Date): string {
    return format(day, 'yyyy-MM-dd');
  }
}
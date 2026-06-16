import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AppointmentCalendarLayerBase,
  ChipPosition,
  LEFT_INSET_PX,
  NARROW_COL_RATIO,
  NARROW_STEP,
  RIGHT_INSET_PX,
} from '../../../appointment-calendar-appointment/appointment-calendar-appointment.base';
import type { AppointmentCalendarItem } from '../../../../interfaces/appointment-calendar.interface';
export type {
  AppointmentCalendarItem,
  ChipClickPayload,
  PositionedChip,
} from '../../../appointment-calendar-appointment/appointment-calendar-appointment.base';
@Component({
  selector: 'app-appointment-calendar-week-layer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-calendar-week-layer.component.html',
  styleUrl: './appointment-calendar-week-layer.component.scss',
})
export class AppointmentCalendarWeekLayerComponent extends AppointmentCalendarLayerBase {
  @Input() public weekStart!: Date;
  protected override shouldRebuildOnChanges(changes: SimpleChanges): boolean {
    return !!(changes['weekStart'] || changes['appointments']);
  }
  protected override getViewAppointments(): Map<number, AppointmentCalendarItem[]> {
    const map = new Map<number, AppointmentCalendarItem[]>();
    if (!this.weekStart) { return map; }
    for (const appt of this.appointments) {
      const idx = this.getDayIndex(appt.startAt);
      if (idx < 0 || idx > 6) { continue; }
      if (!map.has(idx)) { map.set(idx, []); }
      map.get(idx)!.push(appt);
    }
    return map;
  }
  protected override resolvePosition(col: number, dayIdx: number): ChipPosition {
    const CW = `(100% - var(--layer-time-col)) / 7`;
    if (col === 0) {
      return {
        leftCSS:  `calc(var(--layer-time-col) + ${dayIdx} * (${CW}) + ${LEFT_INSET_PX}px)`,
        widthCSS: `calc((${CW}) - ${LEFT_INSET_PX + RIGHT_INSET_PX}px)`,
      };
    }
    const ratio      = Math.max(0.30, NARROW_COL_RATIO - (col - 1) * NARROW_STEP);
    const leftOffset = (1 - ratio).toFixed(4);
    return {
      leftCSS:  `calc(var(--layer-time-col) + ${dayIdx} * (${CW}) + (${CW}) * ${leftOffset})`,
      widthCSS: `calc((${CW}) * ${ratio.toFixed(4)} - ${RIGHT_INSET_PX}px)`,
    };
  }
  protected override getChipAnimPrefix(): string { return 'wlc'; }
  protected override getStyleElId(): string      { return 'wl-chip-keyframes'; }
  protected override isNextChipEnabled(): boolean {
    if (!this.weekStart) { return false; }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(this.weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return today >= this.weekStart && today <= weekEnd;
  }
  private getDayIndex(isoDatetime: string): number {
    const apptDate = isoDatetime.split('T')[0];
    for (let i = 0; i < 7; i++) {
      if (apptDate === this.formatDateStr(this.weekStart, i)) { return i; }
    }
    return -1;
  }
}
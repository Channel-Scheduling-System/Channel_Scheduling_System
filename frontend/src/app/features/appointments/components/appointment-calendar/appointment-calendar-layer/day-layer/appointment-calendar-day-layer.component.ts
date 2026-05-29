import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AppointmentCalendarLayerBase,
  ChipPosition,
  LEFT_INSET_PX,
  NARROW_COL_RATIO,
  NARROW_STEP,
  RIGHT_INSET_PX,
} from '../base/appointment-calendar-layer.base';
import type { AppointmentCalendarItem } from '../../../../interfaces/appointment-calendar.interface';
export type {
  AppointmentCalendarItem,
  ChipClickPayload,
  PositionedChip,
} from '../base/appointment-calendar-layer.base';
@Component({
  selector: 'app-appointment-calendar-day-layer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-calendar-day-layer.component.html',
  styleUrl: './appointment-calendar-day-layer.component.scss',
})
export class AppointmentCalendarDayLayerComponent extends AppointmentCalendarLayerBase {
  @Input() public currentDate!: Date;
  protected override shouldRebuildOnChanges(changes: SimpleChanges): boolean {
    return !!(changes['currentDate'] || changes['appointments']);
  }
  protected override getViewAppointments(): Map<number, AppointmentCalendarItem[]> {
    const map = new Map<number, AppointmentCalendarItem[]>();
    if (!this.currentDate) { return map; }
    const dateStr  = this.formatDateStr(this.currentDate);
    const dayAppts = this.appointments.filter(a => a.startAt.startsWith(dateStr));
    if (dayAppts.length) { map.set(0, dayAppts); }
    return map;
  }
  protected override resolvePosition(col: number, _dayIdx: number): ChipPosition {
    const DL = `var(--layer-day-left)`;
    const DW = `var(--layer-day-col-w)`;
    if (col === 0) {
      return {
        leftCSS:  `calc(${DL} + ${LEFT_INSET_PX}px)`,
        widthCSS: `calc(${DW} - ${LEFT_INSET_PX + RIGHT_INSET_PX}px)`,
      };
    }
    const ratio      = Math.max(0.30, NARROW_COL_RATIO - (col - 1) * NARROW_STEP);
    const leftOffset = (1 - ratio).toFixed(4);
    return {
      leftCSS:  `calc(${DL} + ${DW} * ${leftOffset})`,
      widthCSS: `calc(${DW} * ${ratio.toFixed(4)} - ${RIGHT_INSET_PX}px)`,
    };
  }
  protected override getChipAnimPrefix(): string { return 'wdlc'; }
  protected override getStyleElId(): string      { return 'wdl-chip-keyframes'; }
}
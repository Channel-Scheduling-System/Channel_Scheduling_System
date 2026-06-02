import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AppointmentCalendarLayerBase,
  ChipPosition,
  LEFT_INSET_PX,
  NARROW_COL_RATIO,
  NARROW_STEP,
  RIGHT_INSET_PX,
  PositionedChip,
} from '../../../../appointment-calendar-appointment/appointment-calendar-appointment.base';
import type { AppointmentCalendarItem } from '../../../../../interfaces/appointment-calendar.interface';
import { SessionService } from '../../../../../../../core/services/session.service';
export type {
  AppointmentCalendarItem,
  ChipClickPayload,
  PositionedChip,
} from '../../../../appointment-calendar-appointment/appointment-calendar-appointment.base';
@Component({
  selector: 'app-datetime-calendar-day-appointment-layer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './datetime-calendar-day-appointment-layer.component.html',
  styleUrl: './datetime-calendar-day-appointment-layer.component.scss',
})
export class DatetimeCalendarDayAppointmentLayerComponent extends AppointmentCalendarLayerBase {
  protected readonly session = inject(SessionService);
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
  protected override getChipAnimPrefix(): string { return 'dcal'; }
  protected override getStyleElId(): string      { return 'dcal-chip-keyframes'; }
  protected isChipViewOnly(chip: PositionedChip): boolean {
    if (chip.isConflict) { return false; }
    const role = this.session.getRole();
    if (role !== 'WORKER') { return false; }
    const currentUserId       = this.session.getUserId();
    const appointmentWorkerId = (chip.appointment as any).worker?.id ?? null;
    return appointmentWorkerId !== null && appointmentWorkerId !== currentUserId;
  }
  protected override onChipClick(chip: PositionedChip, event: MouseEvent): void {
    if (this.isChipViewOnly(chip)) {
      event.stopPropagation();
      return;
    }
    super['onChipClick'](chip, event);
  }
}
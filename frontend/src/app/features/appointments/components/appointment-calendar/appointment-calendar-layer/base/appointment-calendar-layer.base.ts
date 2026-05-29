import {
  Directive,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import type {
  AppointmentCalendarItem,
  ChipClickPayload,
  PositionedChip,
} from '../../../../interfaces/appointment-calendar.interface';
import { isoTo12h } from '../../../../utils/appointments-time.util';

export type { AppointmentCalendarItem, ChipClickPayload, PositionedChip };

export const SLOT_H_REM       = 3;
export const LEFT_INSET_PX    = 2;
export const RIGHT_INSET_PX   = 1;
export const NARROW_COL_RATIO = 0.58;
export const NARROW_STEP      = 0.15;

export interface ChipPosition {
  leftCSS:  string;
  widthCSS: string;
}

@Directive()
export abstract class AppointmentCalendarLayerBase
  implements OnChanges, OnDestroy
{
  @Input() public appointments: AppointmentCalendarItem[] = [];
  @Input() public headerHeightRem: number = 5.0;
  @Output() public chipClick = new EventEmitter<ChipClickPayload>();

  protected chips: PositionedChip[] = [];
  private styleEl: HTMLStyleElement | null = null;

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.shouldRebuildOnChanges(changes)) {
      this.buildChips();
    }
  }

  public ngOnDestroy(): void {
    this.styleEl?.remove();
    this.styleEl = null;
  }

  protected abstract shouldRebuildOnChanges(changes: SimpleChanges): boolean;
  protected abstract getViewAppointments(): Map<number, AppointmentCalendarItem[]>;
  protected abstract resolvePosition(col: number, dayIdx: number): ChipPosition;
  protected abstract getChipAnimPrefix(): string;
  protected abstract getStyleElId(): string;

  protected isNextChipEnabled(): boolean {
    return true;
  }

  protected trackByChip(_idx: number, chip: PositionedChip): string {
    const kind = chip.isConflict ? 'c' : 's';
    return `${kind}_${chip.appointment.id}_${chip.top}`;
  }

  protected onChipClick(chip: PositionedChip, event: MouseEvent): void {
    if (!chip.isConflict) {
      this.chipClick.emit({
        appointment: chip.appointment,
        anchorX: event.clientX,
        anchorY: event.clientY,
      });
    }
  }

  private buildChips(): void {
    const byDay = this.getViewAppointments();
    if (!this.appointments?.length || !byDay.size) {
      this.chips = [];
      return;
    }

    this.chips = this.collectChipsFromAllDays(byDay);

    if (this.isNextChipEnabled()) {
      this.markNextChip();
    }
    this.injectColorAnimations();
  }

  private collectChipsFromAllDays(
    byDay: Map<number, AppointmentCalendarItem[]>,
  ): PositionedChip[] {
    const chips: PositionedChip[] = [];
    for (const [dayIdx, dayAppts] of byDay) {
      for (const chip of this.buildDayChips(dayAppts, dayIdx)) {
        chips.push(chip);
      }
    }
    return chips;
  }

  private buildDayChips(
    dayAppts: AppointmentCalendarItem[],
    dayIdx: number,
  ): PositionedChip[] {
    if (!dayAppts.length) { return []; }

    const sorted   = this.sortByStartThenLongest(dayAppts);
    const apptCols = this.assignCollisionColumns(sorted);

    return sorted
      .map((appt, i) => this.appointmentToChip(appt, dayIdx, apptCols[i]))
      .filter((chip): chip is PositionedChip => chip !== null);
  }

  private sortByStartThenLongest(
    appts: AppointmentCalendarItem[],
  ): AppointmentCalendarItem[] {
    return [...appts].sort((a, b) => {
      const diff =
        this.parseIsoToMinutes(a.startAt) - this.parseIsoToMinutes(b.startAt);
      return diff !== 0
        ? diff
        : this.parseIsoToMinutes(b.endAt) - this.parseIsoToMinutes(a.endAt);
    });
  }

  private assignCollisionColumns(sorted: AppointmentCalendarItem[]): number[] {
    const colEndTimes: number[] = [];
    const apptCols:    number[] = [];

    for (const appt of sorted) {
      const startMin = this.parseIsoToMinutes(appt.startAt);
      const endMin   = this.parseIsoToMinutes(appt.endAt);
      const col      = this.findOrCreateColumn(colEndTimes, startMin, endMin);
      apptCols.push(col);
    }

    return apptCols;
  }

  private findOrCreateColumn(
    colEndTimes: number[],
    startMin: number,
    endMin: number,
  ): number {
    for (let col = 0; col < colEndTimes.length; col++) {
      if (colEndTimes[col] <= startMin) {
        colEndTimes[col] = endMin;
        return col;
      }
    }
    colEndTimes.push(endMin);
    return colEndTimes.length - 1;
  }

  private appointmentToChip(
    appt: AppointmentCalendarItem,
    dayIdx: number,
    col: number,
  ): PositionedChip | null {
    const startMin    = this.parseIsoToMinutes(appt.startAt);
    const endMin      = this.parseIsoToMinutes(appt.endAt);
    const durationMin = endMin - startMin;
    if (durationMin <= 0) { return null; }

    const { leftCSS, widthCSS } = this.resolvePosition(col, dayIdx);
    const { color, animName, animDuration } = this.resolveColorProps(appt);

    return {
      appointment:   appt,
      top:           `${this.headerHeightRem + (startMin / 30) * SLOT_H_REM}rem`,
      height:        `${(durationMin / 30) * SLOT_H_REM}rem`,
      left:          leftCSS,
      width:         widthCSS,
      color,
      timeLabel:     `${isoTo12h(appt.startAt)} – ${isoTo12h(appt.endAt)}`,
      serviceLabel:  appt.services.map(s => s.name).join(', ') || 'Cita',
      clientLabel:   `${appt.client.firstName} ${appt.client.lastName}`,
      notes:         appt.notes ?? '',
      animName,
      animDuration,
      statusIcon:    this.statusToIcon(appt.status),
      isConflict:    false,
      zIndex:        col + 2,
      dayIndex:      dayIdx,
      isNext:        false,
      isNextOverlap: false,
    };
  }

  private resolveColorProps(appt: AppointmentCalendarItem): {
    color: string;
    animName: string;
    animDuration: string;
  } {
    const colors     = appt.services.map(s => s.color).filter(Boolean);
    const multiColor = colors.length > 1;
    const prefix     = this.getChipAnimPrefix();
    return {
      color:        colors[0] ?? '#4a0010',
      animName:     multiColor ? `${prefix}${appt.id}` : '',
      animDuration: multiColor ? `${colors.length * 3}s` : '',
    };
  }

  private injectColorAnimations(): void {
    const rules = this.chips
      .filter(chip => !!chip.animName)
      .flatMap(chip => this.buildAnimationRules(chip));

    this.upsertStyleElement(rules.join('\n\n'));
  }

  private buildAnimationRules(chip: PositionedChip): string[] {
    const colors  = chip.appointment.services.map(s => s.color).filter(Boolean);
    const slotPct = 100 / colors.length;
    const holdPct = slotPct * 0.72;

    const keyframeStops = colors.map((c, i) => {
      const start = (i * slotPct).toFixed(2);
      const hold  = (i * slotPct + holdPct).toFixed(2);
      return `  ${start}%, ${hold}% { --chip-color: ${c}; }`;
    }).join('\n');

    return [
      `@keyframes ${chip.animName} {\n${keyframeStops}\n  100% { --chip-color: ${colors[0]}; }\n}`,
      `[data-chip-anim="${chip.animName}"] {\n  animation: ${chip.animName} ${chip.animDuration} ease-in-out infinite;\n}`,
    ];
  }

  private upsertStyleElement(css: string): void {
    if (!this.styleEl) {
      this.styleEl = document.createElement('style');
      this.styleEl.id = this.getStyleElId();
      document.head.appendChild(this.styleEl);
    }
    this.styleEl.textContent = css;
  }

  private markNextChip(): void {
    const nowStr  = this.currentDateTimeStr();
    const next    = this.findNextChip(nowStr);
    if (!next) { return; }

    next.isNext = true;
    this.markOverlappingChips(next);
  }

  private currentDateTimeStr(): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const now = new Date();
    return (
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
      `T${pad(now.getHours())}:${pad(now.getMinutes())}`
    );
  }

  private findNextChip(nowStr: string): PositionedChip | null {
    let next: PositionedChip | null = null;
    for (const chip of this.chips) {
      if (chip.isConflict) { continue; }
      const startStr = chip.appointment.startAt.slice(0, 16);
      if (startStr < nowStr) { continue; }
      if (!next || startStr < next.appointment.startAt.slice(0, 16)) {
        next = chip;
      }
    }
    return next;
  }

  private markOverlappingChips(nextChip: PositionedChip): void {
    const nextStart = nextChip.appointment.startAt.slice(0, 16);
    for (const chip of this.chips) {
      if (chip === nextChip || chip.isConflict) { continue; }
      if (chip.appointment.startAt.slice(0, 16) === nextStart) {
        chip.isNextOverlap = true;
      }
    }
  }

  protected statusToIcon(status: string): string {
    const map: Record<string, string> = {
      PENDING:     'schedule',
      SCHEDULED:   'event_available',
      IN_PROGRESS: 'timelapse',
      COMPLETED:   'task_alt',
    };
    return map[status] ?? 'calendar_month';
  }

  protected parseIsoToMinutes(isoDatetime: string): number {
    const match = isoDatetime.match(/T(\d{2}):(\d{2})/);
    if (!match) { return 0; }
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  }

  protected formatDateStr(base: Date, offsetDays = 0): string {
    const d = new Date(base);
    d.setDate(d.getDate() + offsetDays);
    const y   = d.getFullYear();
    const m   = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import type { WorkerAvailabilityDay, AvailabilitySlot } from '../../../../../../calendar/models/responses/worker-availability-response.model';
export const SLOT_H_REM = 3;
export const HEADER_HEIGHT_REM = 5.0;
export type BlockKind = 'out-of-hours' | 'occupied';
export interface AvailabilityBlock {
  kind:   BlockKind;
  top:    string;
  height: string;
  startMin: number;
  endMin:   number;
}
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
function minToRem(minutes: number): string {
  return `${HEADER_HEIGHT_REM + (minutes / 30) * SLOT_H_REM}rem`;
}
function durationToRem(minutes: number): string {
  return `${(minutes / 30) * SLOT_H_REM}rem`;
}
@Component({
  selector:    'app-datetime-calendar-day-availability-layer',
  standalone:  true,
  imports:     [CommonModule],
  templateUrl: './datetime-calendar-day-availability-layer.component.html',
  styleUrl:    './datetime-calendar-day-availability-layer.component.scss',
})
export class DatetimeCalendarDayAvailabilityLayerComponent implements OnChanges {
  @Input() public availabilityDay: WorkerAvailabilityDay | null = null;
  @Input() public isWorker: boolean = false;
  @Input() public headerHeightRem: number = HEADER_HEIGHT_REM;
  protected blocks: AvailabilityBlock[] = [];
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['availabilityDay'] || changes['headerHeightRem']) {
      this.buildBlocks();
    }
  }
  private buildBlocks(): void {
    const day = this.availabilityDay;
    if (!day) {
      this.blocks = [];
      return;
    }
    const DAY_START = 0;
    const DAY_END   = 24 * 60;
    const outOfHours = this.computeOutOfHours(day.available, DAY_START, DAY_END);
    const occupied = day.occupied.map(slot => this.slotToBlock(slot, 'occupied'));
    this.blocks = [...outOfHours, ...occupied];
  }
  private computeOutOfHours(
    available: AvailabilitySlot[],
    dayStart:  number,
    dayEnd:    number,
  ): AvailabilityBlock[] {
    if (!available.length) {
      return [this.makeBlock('out-of-hours', dayStart, dayEnd)];
    }
    const sorted = [...available]
      .map(s => ({ start: timeToMinutes(s.start), end: timeToMinutes(s.end) }))
      .sort((a, b) => a.start - b.start);
    const gaps: AvailabilityBlock[] = [];
    let cursor = dayStart;
    for (const { start, end } of sorted) {
      if (start > cursor) {
        gaps.push(this.makeBlock('out-of-hours', cursor, start));
      }
      cursor = Math.max(cursor, end);
    }
    if (cursor < dayEnd) {
      gaps.push(this.makeBlock('out-of-hours', cursor, dayEnd));
    }
    return gaps;
  }
  private slotToBlock(slot: AvailabilitySlot, kind: BlockKind): AvailabilityBlock {
    return this.makeBlock(kind, timeToMinutes(slot.start), timeToMinutes(slot.end));
  }
  private makeBlock(kind: BlockKind, startMin: number, endMin: number): AvailabilityBlock {
    const duration = endMin - startMin;
    return {
      kind,
      top:      minToRem(startMin),
      height:   durationToRem(duration),
      startMin,
      endMin,
    };
  }
  protected trackByBlock(_idx: number, block: AvailabilityBlock): string {
    return `${block.kind}_${block.startMin}_${block.endMin}`;
  }
  protected isOccupied(block: AvailabilityBlock): boolean {
    return block.kind === 'occupied';
  }
  protected isOutOfHours(block: AvailabilityBlock): boolean {
    return block.kind === 'out-of-hours';
  }
  protected showOccupiedLabel(block: AvailabilityBlock): boolean {
    return block.kind === 'occupied';
  }
}
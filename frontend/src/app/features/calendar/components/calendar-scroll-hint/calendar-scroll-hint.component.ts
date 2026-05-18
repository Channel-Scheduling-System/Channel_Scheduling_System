import { CommonModule } from '@angular/common';
import { Component, Input, NgZone, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { format } from 'date-fns';
import type { CalendarView } from '../../types/calendar-view.types';
import { ScrollHintObserver } from './scroll-hint-observer';
import { ScrollHintTransitions} from './scroll-hint-transitions';
import { HintSlot } from '../../interfaces/time-slot.interface';

const SETUP_DELAY_MS = 150;

@Component({
  selector:    'app-calendar-scroll-hint',
  standalone:  true,
  imports:     [CommonModule],
  templateUrl: './calendar-scroll-hint.component.html',
  styleUrl:    './calendar-scroll-hint.component.scss',
})
export class CalendarScrollHintComponent implements OnChanges, OnDestroy {

  @Input() gridEl:           HTMLElement | null = null;
  @Input() scrollContainer:  HTMLElement | null = null;
  @Input() view:             CalendarView       = 'week';
  @Input() visibleDays:      Date[]             = [];
  @Input() currentDate:      Date               = new Date();
  @Input() availabilityData: unknown            = null;
  @Input() headerH                              = 60;

  protected hintsByDay = new Map<string, HintSlot>();
  protected overlayTop = 60;

  private readonly _zone        = inject(NgZone);
  private _pending              = false;

  private readonly _transitions = new ScrollHintTransitions(map =>
    this._zone.run(() => { this.hintsByDay = map; }),
  );

  private readonly _observer = new ScrollHintObserver(
    ()  => this._zone.run(() => this._rebuild()),
    (h) => this._zone.run(() => { this.overlayTop = h; }),
    ()  => this.overlayTop,
  );


  ngOnChanges(changes: SimpleChanges): void {
    const watched = ['gridEl', 'visibleDays', 'view', 'headerH', 'availabilityData'];
    if (watched.some(k => k in changes) && !this._pending) {
      this._pending = true;
      setTimeout(() => { this._pending = false; this._setup(); }, SETUP_DELAY_MS);
    }
  }

  ngOnDestroy(): void {
    this._observer.teardown();
    this._transitions.destroy();
  }


  private _setup(): void {
    this._observer.teardown();
    this.hintsByDay = new Map();

    const grid = this.gridEl?.querySelector<HTMLElement>('.cal-grid') ?? null;
    const root = this.scrollContainer;
    if (!grid || !root) return;

    this._observer.setup(grid, root);
  }


  private _rebuild(): void {
    const desired   = this._computeDesired();
    this.hintsByDay = this._transitions.reconcile(this.hintsByDay, desired);

    this.hintsByDay.size > 0
      ? this._observer.startRaf()
      : this._observer.stopRaf();
  }

  private _computeDesired(): Map<string, Omit<HintSlot, 'visible'>> {
    type Best = { startEl: HTMLElement; bottom: number; type: HintSlot['type']; reason: string };
    const best = new Map<string, Best>();

    for (const state of this._observer.entries.values()) {
      if (!state.startAbove || state.endAbove || !state.dayKey) continue;
      const bottom  = state.startEl.getBoundingClientRect().bottom;
      const current = best.get(state.dayKey);
      if (!current || bottom > current.bottom) {
        best.set(state.dayKey, { startEl: state.startEl, bottom, type: state.type, reason: state.reason });
      }
    }

    const desired = new Map<string, Omit<HintSlot, 'visible'>>();
    for (const [dayKey, { startEl, type, reason }] of best) {
      desired.set(dayKey, { startEl, type, reason });
    }
    return desired;
  }


  protected scrollToEntity(dayKey: string): void {
    const hint = this.hintsByDay.get(dayKey);
    if (!hint?.startEl || !this.scrollContainer) return;
    const c  = this.scrollContainer;
    const er = hint.startEl.getBoundingClientRect();
    const cr = c.getBoundingClientRect();
    c.scrollTo({
      top: Math.max(0, c.scrollTop + er.top - cr.top - this.overlayTop - 12),
      behavior: 'smooth',
    });
  }

  protected getDayKey(day: Date): string { return format(day, 'yyyy-MM-dd'); }

  protected getHintForDay(day: Date): HintSlot | null {
    return this.hintsByDay.get(this.getDayKey(day)) ?? null;
  }

  protected trackByDay(_: number, day: Date): string { return day.toISOString(); }
}
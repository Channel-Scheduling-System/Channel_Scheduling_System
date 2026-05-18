import { DEFAULT_REASONS } from "../../constants/availability-reasons.constants";
import { ObservedEntry } from "../../interfaces/observed-entry.interface";

const RAF_VERIFY_EVERY = 10;   

export class ScrollHintObserver {

  readonly entries = new Map<string, ObservedEntry>();

  private _obsStart:  IntersectionObserver | null = null;
  private _obsEnd:    IntersectionObserver | null = null;
  private _resizeObs: ResizeObserver        | null = null;
  private _gridMo:    MutationObserver      | null = null;

  private _scrollListener: (() => void) | null = null;
  private _scrollTimer:    ReturnType<typeof setTimeout> | null = null;

  private _rafId:    number | null = null;
  private _rafCount = 0;

  constructor(
    private readonly onRebuild:    () => void,
    private readonly onHeaderH:    (h: number) => void,
    private readonly getHeaderH:   () => number,
  ) {}

  public setup(grid: HTMLElement, root: HTMLElement): void {
    this._watchHeader(grid);

    const h    = this.getHeaderH();
    const opts = { root, rootMargin: `-${h}px 0px 0px 0px`, threshold: 0 };

    this._obsEnd = new IntersectionObserver(
      es => this._onEnd(es, root, h), opts,
    );
    this._obsStart = new IntersectionObserver(
      es => this._onStart(es, grid, root, h), opts,
    );

    const startEls = grid.querySelectorAll<HTMLElement>('[data-sh-start]');
    startEls.forEach(el => this._obsStart!.observe(el));

    if (!startEls.length) this._waitForSegments(grid);

    this._attachScroll(root);
  }

  public teardown(): void {
    this._stopRaf();
    this._clearScroll();
    this._obsStart?.disconnect();
    this._obsEnd?.disconnect();
    this._resizeObs?.disconnect();
    this._gridMo?.disconnect();
    this._obsStart = this._obsEnd = this._resizeObs = this._gridMo = null;
    this.entries.clear();
    if (this._scrollTimer) clearTimeout(this._scrollTimer);
    this._scrollTimer = null;
  }

  public startRaf(): void {
    if (this._rafId !== null) return;
    this._rafCount = 0;
    const loop = () => {
      if (this.entries.size === 0) { this._rafId = null; return; }
      if (++this._rafCount % RAF_VERIFY_EVERY === 0) this._verify();
      this._rafId = requestAnimationFrame(loop);
    };
    this._rafId = requestAnimationFrame(loop);
  }

  public stopRaf(): void {
    if (this._rafId !== null) { cancelAnimationFrame(this._rafId); this._rafId = null; }
    this._rafCount = 0;
  }

  private _watchHeader(grid: HTMLElement): void {
    const measure = () => {
      const h = grid.querySelector<HTMLElement>('.cal-grid__day-header')?.offsetHeight
                ?? this.getHeaderH();
      this.onHeaderH(h);
    };
    measure();
    const el = grid.querySelector<HTMLElement>('.cal-grid__day-header');
    if (el) {
      this._resizeObs = new ResizeObserver(measure);
      this._resizeObs.observe(el);
    }
  }

  private _onEnd(
    entries: IntersectionObserverEntry[],
    root: HTMLElement, h: number,
  ): void {
    let changed = false;
    for (const e of entries) {
      const state = this.entries.get((e.target as HTMLElement).dataset['shEnd'] ?? '');
      if (!state) continue;
      const above = this._isAbove(e, root, h);
      if (state.endAbove !== above) { state.endAbove = above; changed = true; }
    }
    if (changed) this.onRebuild();
  }

  private _onStart(
    entries: IntersectionObserverEntry[],
    grid: HTMLElement, root: HTMLElement, h: number,
  ): void {
    let changed = false;
    for (const e of entries) {
      const el  = e.target as HTMLElement;
      const key = el.dataset['shStart'];
      if (!key) continue;
      const state = this.entries.get(key) ?? this._register(key, el, grid);
      if (!state) continue;
      const above = this._isAbove(e, root, h);
      if (state.startAbove !== above) { state.startAbove = above; changed = true; }
    }
    if (changed) this.onRebuild();
  }

  private _register(key: string, startEl: HTMLElement, grid: HTMLElement): ObservedEntry | null {
    const endEl = Array.from(grid.querySelectorAll<HTMLElement>('[data-sh-end]'))
      .find(e => e.dataset['shEnd'] === key) ?? null;
    if (!endEl || endEl === startEl) return null;

    const type  = (startEl.dataset['shType'] ?? 'timeoff') as ObservedEntry['type'];
    const raw   = startEl.dataset['shReason']?.trim() ?? '';
    const entry: ObservedEntry = {
      type,
      reason:     raw || DEFAULT_REASONS[type] || DEFAULT_REASONS['timeoff'],
      dayKey:     startEl.dataset['shDay'] ?? '',
      startEl, endEl,
      startAbove: false,
      endAbove:   false,
    };

    this.entries.set(key, entry);
    try { this._obsEnd!.observe(endEl); } catch { /* noop */ }
    return entry;
  }

  private _verify(): void {
    if (!this._obsStart) return;
    const root = (this._obsStart as any).root as HTMLElement | null;
    if (!root) return;
    const h          = this.getHeaderH();
    const rootRect   = root.getBoundingClientRect();
    const threshold  = rootRect.top + h;
    const viewBottom = rootRect.bottom;

    let changed = false;
    for (const state of this.entries.values()) {
      const sr = state.startEl.getBoundingClientRect();
      if (sr.top > viewBottom) {
        if (state.startAbove || state.endAbove) {
          state.startAbove = state.endAbove = false;
          changed = true;
        }
        continue;
      }
      const start = sr.bottom < threshold + 4;
      const end   = state.endEl.getBoundingClientRect().bottom < threshold + 4;
      if (state.startAbove !== start || state.endAbove !== end) {
        state.startAbove = start;
        state.endAbove   = end;
        changed = true;
      }
    }
    if (changed) this.onRebuild();
  }

  private _waitForSegments(grid: HTMLElement): void {
    this._gridMo = new MutationObserver(() => {
      if (grid.querySelectorAll('[data-sh-start]').length) {
        this._gridMo?.disconnect();
        this._gridMo = null;
        const root = (this._obsStart as any)?.root as HTMLElement | null;
        if (root) this.setup(grid, root);
      }
    });
    this._gridMo.observe(grid, {
      childList: true, subtree: true,
      attributes: true, attributeFilter: ['data-sh-start'],
    });
  }


  private _attachScroll(root: HTMLElement): void {
    this._scrollListener = () => {
      if (this._scrollTimer) clearTimeout(this._scrollTimer);
      this._scrollTimer = setTimeout(() => {
        this._scrollTimer = null;
        requestAnimationFrame(() => this._verify());
      }, 80);
    };
    root.addEventListener('scroll', this._scrollListener, { passive: true });
  }

  private _clearScroll(): void {
    if (this._scrollListener && this._obsStart) {
      const root = (this._obsStart as any)?.root as HTMLElement | null;
      root?.removeEventListener('scroll', this._scrollListener);
    }
    this._scrollListener = null;
  }

  

  private _isAbove(e: IntersectionObserverEntry, root: HTMLElement, h: number): boolean {
    if (e.isIntersecting) return false;
    return e.boundingClientRect.bottom < root.getBoundingClientRect().top + h + 4;
  }

  private _stopRaf(): void {
    if (this._rafId !== null) { cancelAnimationFrame(this._rafId); this._rafId = null; }
  }
}
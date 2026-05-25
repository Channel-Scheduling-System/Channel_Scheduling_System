import { DEFAULT_REASONS } from "../../constants/availability-reasons.constants";
import { ObservedEntry } from "../../interfaces/observed-entry.interface";
export class ScrollHintObserver {
    readonly entries = new Map<string, ObservedEntry>();
    private _obsStart: IntersectionObserver | null = null;
    private _obsEnd: IntersectionObserver | null = null;
    private _resizeObs: ResizeObserver | null = null;
    private _rootResizeObs: ResizeObserver | null = null;
    private _gridMo: MutationObserver | null = null;
    private _root: HTMLElement | null = null;
    private _scrollListener: (() => void) | null = null;
    private _scrollRafPending = false;
    private _rootTop = 0;
    private _rootBottom = 0;
    private _scrollEndTimer: ReturnType<typeof setTimeout> | null = null;
    constructor(
        private readonly onRebuild: () => void,
        private readonly onHeaderH: (h: number) => void,
        private readonly getHeaderH: () => number,
    ) { }
    public setup(grid: HTMLElement, root: HTMLElement): void {
        this._root = root;
        this._syncRootRect();
        this._watchHeader(grid);
        this._watchRootResize(root);
        const h = this.getHeaderH();
        const opts = { root, rootMargin: `-${h}px 0px 0px 0px`, threshold: 0 };
        this._obsEnd = new IntersectionObserver(es => this._onEnd(es), opts);
        this._obsStart = new IntersectionObserver(es => this._onStart(es, grid), opts);
        const startEls = grid.querySelectorAll<HTMLElement>('[data-sh-start]');
        startEls.forEach(el => this._obsStart!.observe(el));
        if (!startEls.length) this._waitForSegments(grid);
        this._attachScroll(root);
    }
    public teardown(): void {
        this._clearScroll();
        this._obsStart?.disconnect();
        this._obsEnd?.disconnect();
        this._resizeObs?.disconnect();
        this._rootResizeObs?.disconnect();
        this._gridMo?.disconnect();
        this._obsStart = this._obsEnd = this._resizeObs = this._rootResizeObs = this._gridMo = null;
        this._root = null;
        this.entries.clear();
    }
    /** Un único getBoundingClientRect por resize/scroll — no por frame. */
    private _syncRootRect(): void {
        if (!this._root) return;
        const r = this._root.getBoundingClientRect();
        this._rootTop = r.top;
        this._rootBottom = r.bottom;
    }
    private _watchRootResize(root: HTMLElement): void {
        this._rootResizeObs = new ResizeObserver(() => this._syncRootRect());
        this._rootResizeObs.observe(root);
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
    private _onEnd(entries: IntersectionObserverEntry[]): void {
        let changed = false;
        for (const e of entries) {
            const state = this.entries.get((e.target as HTMLElement).dataset['shEnd'] ?? '');
            if (!state) continue;
            const above = this._isAbove(e);
            if (state.endAbove !== above) { state.endAbove = above; changed = true; }
        }
        if (changed) this.onRebuild();
    }
    private _onStart(entries: IntersectionObserverEntry[], grid: HTMLElement): void {
        let changed = false;
        for (const e of entries) {
            const el = e.target as HTMLElement;
            const key = el.dataset['shStart'];
            if (!key) continue;
            const state = this.entries.get(key) ?? this._register(key, el, grid);
            if (!state) continue;
            const above = this._isAbove(e);
            if (state.startAbove !== above) { state.startAbove = above; changed = true; }
        }
        if (changed) this.onRebuild();
    }
    private _register(key: string, startEl: HTMLElement, grid: HTMLElement): ObservedEntry | null {
        const endEl = Array.from(grid.querySelectorAll<HTMLElement>('[data-sh-end]'))
            .find(e => e.dataset['shEnd'] === key) ?? null;
        if (!endEl || endEl === startEl) return null;
        const type = (startEl.dataset['shType'] ?? 'timeoff') as ObservedEntry['type'];
        const raw = startEl.dataset['shReason']?.trim() ?? '';
        const entry: ObservedEntry = {
            type,
            reason: raw || DEFAULT_REASONS[type] || DEFAULT_REASONS['timeoff'],
            dayKey: startEl.dataset['shDay'] ?? '',
            startEl, endEl,
            startAbove: false,
            endAbove: false,
            lastBottom: 0,
        };
        this.entries.set(key, entry);
        try { this._obsEnd!.observe(endEl); } catch { }
        return entry;
    }
    private _verify(): void {
        if (!this._root || this.entries.size === 0) return;
        const h = this.getHeaderH();
        const threshold = this._rootTop + h;
        const viewBottom = this._rootBottom;
        const entriesArr = Array.from(this.entries.values());
        const startRects = entriesArr.map(s => s.startEl.getBoundingClientRect());
        const endRects = entriesArr.map(s => s.endEl.getBoundingClientRect());
        let changed = false;
        for (let i = 0; i < entriesArr.length; i++) {
            const state = entriesArr[i];
            const sr = startRects[i];
            const er = endRects[i];
            state.lastBottom = sr.bottom;
            if (sr.top > viewBottom) {
                if (state.startAbove || state.endAbove) {
                    state.startAbove = state.endAbove = false;
                    changed = true;
                }
                continue;
            }
            const start = sr.bottom < threshold + 4;
            const end = er.bottom < threshold + 4;
            if (state.startAbove !== start || state.endAbove !== end) {
                state.startAbove = start;
                state.endAbove = end;
                changed = true;
            }
        }
        if (changed) this.onRebuild();
    }
    private _attachScroll(root: HTMLElement): void {
        this._scrollListener = () => {
            if (!this._scrollRafPending) {
                this._scrollRafPending = true;
                requestAnimationFrame(() => {
                    this._scrollRafPending = false;
                    this._syncRootRect();
                    this._verify();
                });
            }
            if (this._scrollEndTimer) clearTimeout(this._scrollEndTimer);
            this._scrollEndTimer = setTimeout(() => {
                this._scrollEndTimer = null;
                this._syncRootRect();
                this._verify();
            }, 120);
        };
        root.addEventListener('scroll', this._scrollListener, { passive: true });
    }
    private _clearScroll(): void {
        if (this._scrollListener && this._root) {
            this._root.removeEventListener('scroll', this._scrollListener);
        }
        this._scrollListener = null;
        this._scrollRafPending = false;
        if (this._scrollEndTimer) {
            clearTimeout(this._scrollEndTimer);
            this._scrollEndTimer = null;
        }
    }
    private _waitForSegments(grid: HTMLElement): void {
        this._gridMo = new MutationObserver(() => {
            if (grid.querySelectorAll('[data-sh-start]').length) {
                this._gridMo?.disconnect();
                this._gridMo = null;
                if (this._root) this.setup(grid, this._root);
            }
        });
        this._gridMo.observe(grid, {
            childList: true, subtree: true,
            attributes: true, attributeFilter: ['data-sh-start'],
        });
    }
    private _isAbove(e: IntersectionObserverEntry): boolean {
        if (e.isIntersecting) return false;
        return e.boundingClientRect.bottom < this._rootTop + this.getHeaderH() + 4;
    }
}
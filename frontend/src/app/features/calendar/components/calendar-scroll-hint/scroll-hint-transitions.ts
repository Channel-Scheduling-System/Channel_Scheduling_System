import { HintSlot } from "../../interfaces/time-slot.interface";

type HintData = Omit<HintSlot, 'visible'>;

const APPEAR_DELAY_MS = 20;
const FADE_DELAY_MS   = 200;
const REMOVE_DELAY_MS = 250;

export class ScrollHintTransitions {

  private readonly _timers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private readonly onUpdate: (map: Map<string, HintSlot>) => void) {}

  public reconcile(
    current: Map<string, HintSlot>,
    desired: Map<string, HintData>,
  ): Map<string, HintSlot> {
    const next = new Map<string, HintSlot>();

    for (const [dayKey, data] of desired) {
      const existing = current.get(dayKey);
      if (!existing) {
        next.set(dayKey, this._appear(dayKey, data, next));
      } else if (existing.type !== data.type || existing.reason !== data.reason) {
        next.set(dayKey, this._crossfade(dayKey, existing, data, next));
      } else {
        next.set(dayKey, { ...existing, visible: true });
      }
    }

    for (const [dayKey, hint] of current) {
      if (!next.has(dayKey)) next.set(dayKey, this._disappear(dayKey, hint, next));
    }

    return next;
  }

  public destroy(): void {
    this._timers.forEach(t => clearTimeout(t));
    this._timers.clear();
  }


  private _appear(dayKey: string, data: HintData, map: Map<string, HintSlot>): HintSlot {
    this._cancel(`show-${dayKey}`);
    const slot: HintSlot = { ...data, visible: false };

    this._set(`show-${dayKey}`, APPEAR_DELAY_MS, () => {
      if (map.get(dayKey) === slot) {
        slot.visible = true;
        this.onUpdate(new Map(map));
      }
    });

    return slot;
  }

  private _crossfade(
    dayKey:   string,
    existing: HintSlot,
    data:     HintData,
    map:      Map<string, HintSlot>,
  ): HintSlot {
    existing.visible = false;
    this._cancel(dayKey);

    this._set(dayKey, FADE_DELAY_MS, () => {
      const h = map.get(dayKey);
      if (h) { Object.assign(h, data); h.visible = true; this.onUpdate(new Map(map)); }
    });

    return existing;
  }

  private _disappear(dayKey: string, hint: HintSlot, map: Map<string, HintSlot>): HintSlot {
    hint.visible = false;
    this._cancel(`show-${dayKey}`);
    this._cancel(`rm-${dayKey}`);

    this._set(`rm-${dayKey}`, REMOVE_DELAY_MS, () => {
      const h = map.get(dayKey);
      if (h && !h.visible) { const m = new Map(map); m.delete(dayKey); this.onUpdate(m); }
    });

    return hint;
  }


  private _set(key: string, ms: number, fn: () => void): void {
    this._timers.set(key, setTimeout(fn, ms));
  }

  private _cancel(key: string): void {
    const t = this._timers.get(key);
    if (t !== undefined) { clearTimeout(t); this._timers.delete(key); }
  }
}
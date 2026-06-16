import { Injectable, signal } from "@angular/core";
import { TooltipData, TooltipState } from "../interfaces/tooltip.interface";
@Injectable({ providedIn: 'root' })
export class CalendarTooltipService {
  readonly state = signal<TooltipState>({ visible: false, x: 0, y: 0, data: null });
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pendingX = 0;
  private pendingY = 0;
  private pendingData: TooltipData | null = null;
  schedule(x: number, y: number, data: TooltipData): void {
    this.pendingX = x;
    this.pendingY = y;
    this.pendingData = data;
    this.clearTimer();
    this.timer = setTimeout(() => {
      this.state.set({ visible: true, x: this.pendingX, y: this.pendingY, data: this.pendingData });
    }, 500);
  }
  resetTimer(x: number, y: number): void {
    this.pendingX = x;
    this.pendingY = y;
    if (this.state().visible) {
      this.state.update(s => ({ ...s, x, y }));
      return;
    }
    if (!this.pendingData) return;
    this.clearTimer();
    this.timer = setTimeout(() => {
      this.state.set({ visible: true, x: this.pendingX, y: this.pendingY, data: this.pendingData });
    }, 500);
  }
  hide(): void {
    this.clearTimer();
    this.pendingData = null;
    this.state.update(s => ({ ...s, visible: false, data: null }));
  }
  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
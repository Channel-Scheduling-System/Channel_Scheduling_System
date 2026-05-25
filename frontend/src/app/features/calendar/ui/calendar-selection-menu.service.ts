import { Injectable, signal } from '@angular/core';
export interface ContextMenuAction {
  icon: string;
  label: string;
  handler: () => void;
}
export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  headerIcon: string;
  label: string;
  actions: ContextMenuAction[];
}
@Injectable({ providedIn: 'root' })
export class CalendarSelectionMenuService {
  private _state = signal<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    headerIcon: '',
    label: '',
    actions: [],
  });
  readonly state = this._state.asReadonly();
  show(x: number, y: number, headerIcon: string, label: string, actions: ContextMenuAction[]): void {
    this._state.set({ visible: true, x, y, headerIcon, label, actions });
  }
  hide(): void {
    this._state.update(s => ({ ...s, visible: false }));
  }
}
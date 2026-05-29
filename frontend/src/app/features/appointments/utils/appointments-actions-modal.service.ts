import { Injectable, signal } from '@angular/core';

export interface AppointmentActionModalAction {
  icon: string;
  label: string;
  handler: () => void;
  /** Optional: tints the action button with a danger/warning tone */
  variant?: 'default' | 'danger';
}

export interface AppointmentActionModalState {
  visible: boolean;
  headerIcon: string;
  title: string;
  subtitle?: string;
  actions: AppointmentActionModalAction[];
  /** Viewport coordinates of the click that triggered the modal (used for smart positioning). */
  anchorX?: number;
  anchorY?: number;
  statusLabel?: string;
  notes?: string | null;
  statusKey?: string;
}

const INITIAL_STATE: AppointmentActionModalState = {
  visible: false,
  headerIcon: 'event',
  title: '',
  subtitle: undefined,
  actions: [],
  anchorX: undefined,
  anchorY: undefined,
};

@Injectable({ providedIn: 'root' })
export class AppointmentActionModalService {

  readonly state = signal<AppointmentActionModalState>({ ...INITIAL_STATE });

  show(options: Omit<AppointmentActionModalState, 'visible'>): void {
    this.state.set({ ...options, visible: true });
  }

  hide(): void {
    this.state.update(s => ({ ...s, visible: false }));
  }
}
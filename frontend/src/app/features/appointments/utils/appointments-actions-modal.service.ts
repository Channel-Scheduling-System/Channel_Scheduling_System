import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface AppointmentActionModalAction {
  icon: string;
  label: string;
  handler: () => void;
  variant?: 'default' | 'danger';
}

export interface AppointmentActionModalState {
  visible: boolean;
  headerIcon: string;
  title: string;
  subtitle?: string;
  actions: AppointmentActionModalAction[];
  anchorX?: number;
  anchorY?: number;
  statusLabel?: string;
  notes?: string | null;
  statusKey?: string;
  appointmentId?: number;
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

  readonly stateUpdated$ = new Subject<void>();

  show(options: Omit<AppointmentActionModalState, 'visible'>): void {
    this.state.set({ ...options, visible: true });
  }

  hide(): void {
    this.state.update(s => ({ ...s, visible: false }));
  }

  notifyStateUpdated(): void {
    this.stateUpdated$.next();
  }
}
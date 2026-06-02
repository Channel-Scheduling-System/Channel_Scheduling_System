import { Injectable, signal, computed } from '@angular/core';
import { Service } from '../../../shared/models/entities/service.schema';
import { ListUserItem } from '../../users/models/responses/list-users-response.model';

export type WizardRole = 'CLIENT' | 'WORKER';

export interface AppointmentCreateState {
  currentStep: number;
  userRole: WizardRole;
  currentUserId: number;
  selectedServices: Service[];
  /** Per-service duration overrides (keyed by service id). WORKER only. */
  durationOverrides: Record<number, number>;
  /** Per-service price overrides (keyed by service id). WORKER only. */
  priceOverrides: Record<number, number>;
  lockedWorkerId: number | null;
  // Step 2 — reserved for future use
  selectedWorkerForAppointment: ListUserItem | null;
  // Step 3 — reserved for future use
  selectedDateTime: Date | null;
  // Step 4 — reserved for future use
  notes: string;
}

const INITIAL_STATE: AppointmentCreateState = {
  currentStep: 1,
  userRole: 'CLIENT',
  currentUserId: 0,
  selectedServices: [],
  durationOverrides: {},
  priceOverrides: {},
  lockedWorkerId: null,
  selectedWorkerForAppointment: null,
  selectedDateTime: null,
  notes: '',
};

export const MAX_SERVICES = 5;
/** Internal step numbers — always 1-4. Step 2 is skipped for CLIENT role. */
export const TOTAL_STEPS = 4;
/** Step number that is exclusive to WORKER role (select client) */
export const WORKER_ONLY_STEP = 2;

@Injectable()
export class AppointmentCreateService {

  // ── Core state signal ──────────────────────────────────────────────────────
  private readonly _state = signal<AppointmentCreateState>({ ...INITIAL_STATE });

  // ── Public read-only computed signals ─────────────────────────────────────
  public readonly state            = this._state.asReadonly();
  public readonly currentStep      = computed(() => this._state().currentStep);
  public readonly userRole         = computed(() => this._state().userRole);
  public readonly currentUserId    = computed(() => this._state().currentUserId);
  public readonly selectedServices = computed(() => this._state().selectedServices);
  public readonly lockedWorkerId   = computed(() => this._state().lockedWorkerId);
  public readonly durationOverrides = computed(() => this._state().durationOverrides);
  public readonly priceOverrides    = computed(() => this._state().priceOverrides);

  /** Step 2 placeholder — will hold the worker selected FOR the appointment */
  public readonly selectedWorkerForAppointment = computed(
    () => this._state().selectedWorkerForAppointment
  );

  /** Step 3 placeholder */
  public readonly selectedDateTime = computed(() => this._state().selectedDateTime);

  /** Step 4 placeholder */
  public readonly notes = computed(() => this._state().notes);

  // ── Role-aware step helpers ────────────────────────────────────────────────
  /** Total steps visible for the current role (3 for CLIENT, 4 for WORKER) */
  public readonly totalVisibleSteps = computed(() =>
    this._state().userRole === 'WORKER' ? 4 : 3
  );

  /**
   * Maps the internal step number to its visible position for the progress bar.
   * CLIENT: 1→1, 3→2, 4→3  (step 2 is skipped)
   * WORKER: 1→1, 2→2, 3→3, 4→4
   */
  public readonly visibleStep = computed(() => {
    const { currentStep, userRole } = this._state();
    if (userRole === 'WORKER') return currentStep;
    return currentStep <= 1 ? currentStep : currentStep - 1;
  });

  // ── Derived computed signals ───────────────────────────────────────────────
  public readonly canGoNext = computed(() => {
    const s = this._state();
    switch (s.currentStep) {
      case 1: return s.selectedServices.length > 0;
      case 2: return s.selectedWorkerForAppointment !== null;
      case 3: return s.selectedDateTime !== null;
      case 4: return true;
      default: return false;
    }
  });

  public readonly canGoBack = computed(
    () => this._state().currentStep > 1
  );

  public readonly isLastStep = computed(() => {
    const { currentStep } = this._state();
    return currentStep === TOTAL_STEPS;
  });

  public readonly totalPrice = computed(() => {
    const { selectedServices, priceOverrides } = this._state();
    return selectedServices.reduce((acc, s) => {
      const override = priceOverrides[s.id];
      return acc + (override !== undefined ? override : s.price);
    }, 0);
  });

  /**
   * Total duration respects per-service overrides set by WORKER in step 1.
   * For CLIENT the overrides map is always empty so original durations are used.
   */
  public readonly totalDuration = computed(() => {
    const { selectedServices, durationOverrides } = this._state();
    return selectedServices.reduce((acc, s) => {
      const override = durationOverrides[s.id];
      return acc + (override !== undefined ? override : s.duration);
    }, 0);
  });

  /**
   * Returns the effective duration for a service (override if present, original otherwise).
   */
  public getEffectiveDuration(serviceId: number): number {
    const { selectedServices, durationOverrides } = this._state();
    const override = durationOverrides[serviceId];
    if (override !== undefined) return override;
    return selectedServices.find(s => s.id === serviceId)?.duration ?? 0;
  }

  /**
   * Returns the effective price for a service (override if present, original otherwise).
   */
  public getEffectivePrice(serviceId: number): number {
    const { selectedServices, priceOverrides } = this._state();
    const override = priceOverrides[serviceId];
    if (override !== undefined) return override;
    return selectedServices.find(s => s.id === serviceId)?.price ?? 0;
  }

  // ── Initialization ─────────────────────────────────────────────────────────
  public init(userRole: WizardRole, currentUserId: number): void {
    this._state.set({ ...INITIAL_STATE, userRole, currentUserId });
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  public nextStep(): void {
    this._state.update(s => {
      let next = s.currentStep + 1;
      if (s.userRole === 'CLIENT' && next === WORKER_ONLY_STEP) next++;
      return { ...s, currentStep: Math.min(next, TOTAL_STEPS) };
    });
  }

  public prevStep(): void {
    this._state.update(s => {
      let prev = s.currentStep - 1;
      if (s.userRole === 'CLIENT' && prev === WORKER_ONLY_STEP) prev--;
      return { ...s, currentStep: Math.max(prev, 1) };
    });
  }

  public goToStep(step: number): void {
    if (step < 1 || step > TOTAL_STEPS) return;
    if (this._state().userRole === 'CLIENT' && step === WORKER_ONLY_STEP) return;
    this._state.update(s => ({ ...s, currentStep: step }));
  }

  // ── Step 1: Service selection ──────────────────────────────────────────────
  public addService(service: Service): void {
    this._state.update(s => {
      if (s.selectedServices.length >= MAX_SERVICES) return s;
      if (s.selectedServices.some(sv => sv.id === service.id)) return s;
      const newServices = [...s.selectedServices, service];
      const lockedWorkerId = newServices.length === 1 ? service.worker.id : s.lockedWorkerId;
      return { ...s, selectedServices: newServices, lockedWorkerId };
    });
  }

  public removeService(serviceId: number): void {
    this._state.update(s => {
      const newServices = s.selectedServices.filter(sv => sv.id !== serviceId);
      const lockedWorkerId = newServices.length === 0 ? null : s.lockedWorkerId;
      // Clean up any override for the removed service
      const durationOverrides = { ...s.durationOverrides };
      delete durationOverrides[serviceId];
      const priceOverrides = { ...s.priceOverrides };
      delete priceOverrides[serviceId];
      return { ...s, selectedServices: newServices, lockedWorkerId, durationOverrides, priceOverrides };
    });
  }

  public lockWorker(workerId: number): void {
    this._state.update(s => ({ ...s, lockedWorkerId: workerId }));
  }

  public clearWorkerLock(): void {
    this._state.update(s => ({
      ...s,
      lockedWorkerId: null,
      selectedServices: [],
      durationOverrides: {},
      priceOverrides: {},
    }));
  }

  public isServiceSelected(serviceId: number): boolean {
    return this._state().selectedServices.some(s => s.id === serviceId);
  }

  public isServiceDisabled(service: Service): boolean {
    const locked = this._state().lockedWorkerId;
    if (locked === null) return false;
    return service.worker.id !== locked;
  }

  /**
   * Sets a duration override for a specific service (WORKER only).
   * Pass null to remove the override and restore the original duration.
   */
  public setDurationOverride(serviceId: number, duration: number | null): void {
    this._state.update(s => {
      const durationOverrides = { ...s.durationOverrides };
      if (duration === null) {
        delete durationOverrides[serviceId];
      } else {
        durationOverrides[serviceId] = duration;
      }
      return { ...s, durationOverrides };
    });
  }

  /**
   * Sets a price override for a specific service (WORKER only).
   * Pass null to remove the override and restore the original price.
   */
  public setPriceOverride(serviceId: number, price: number | null): void {
    this._state.update(s => {
      const priceOverrides = { ...s.priceOverrides };
      if (price === null) {
        delete priceOverrides[serviceId];
      } else {
        priceOverrides[serviceId] = price;
      }
      return { ...s, priceOverrides };
    });
  }

  // ── Step 2: Worker for appointment (placeholder) ───────────────────────────
  public setSelectedWorkerForAppointment(worker: ListUserItem | null): void {
    this._state.update(s => ({ ...s, selectedWorkerForAppointment: worker }));
  }

  // ── Step 3: Date/time selection (placeholder) ──────────────────────────────
  public setSelectedDateTime(dateTime: Date | null): void {
    this._state.update(s => ({ ...s, selectedDateTime: dateTime }));
  }

  // ── Step 4: Notes (placeholder) ───────────────────────────────────────────
  public setNotes(notes: string): void {
    this._state.update(s => ({ ...s, notes }));
  }

  // ── Full reset ─────────────────────────────────────────────────────────────
  public reset(): void {
    this._state.set({ ...INITIAL_STATE });
  }
}
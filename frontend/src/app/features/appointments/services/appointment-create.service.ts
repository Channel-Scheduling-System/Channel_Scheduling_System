import { Injectable, signal, computed } from '@angular/core';
import { Service } from '../../../shared/models/entities/service.schema';
import { ListUserItem } from '../../users/models/responses/list-users-response.model';
export type WizardRole = 'CLIENT' | 'WORKER';
export interface AppointmentCreateState {
  currentStep: number;
  userRole: WizardRole;
  currentUserId: number;
  selectedServices: Service[];
  durationOverrides: Record<number, number>;
  priceOverrides: Record<number, number>;
  lockedWorkerId: number | null;
  selectedWorkerForAppointment: ListUserItem | null;
  selectedDateTime: Date | null;
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
export const TOTAL_STEPS = 4;
export const WORKER_ONLY_STEP = 2;
@Injectable()
export class AppointmentCreateService {
  private readonly _state = signal<AppointmentCreateState>({ ...INITIAL_STATE });
  public readonly state            = this._state.asReadonly();
  public readonly currentStep      = computed(() => this._state().currentStep);
  public readonly userRole         = computed(() => this._state().userRole);
  public readonly currentUserId    = computed(() => this._state().currentUserId);
  public readonly selectedServices = computed(() => this._state().selectedServices);
  public readonly lockedWorkerId   = computed(() => this._state().lockedWorkerId);
  public readonly durationOverrides = computed(() => this._state().durationOverrides);
  public readonly priceOverrides    = computed(() => this._state().priceOverrides);
  public readonly selectedWorkerForAppointment = computed(
    () => this._state().selectedWorkerForAppointment
  );
  public readonly selectedDateTime = computed(() => this._state().selectedDateTime);
  public readonly notes = computed(() => this._state().notes);
  public readonly totalVisibleSteps = computed(() =>
    this._state().userRole === 'WORKER' ? 4 : 3
  );
  public readonly visibleStep = computed(() => {
    const { currentStep, userRole } = this._state();
    if (userRole === 'WORKER') return currentStep;
    return currentStep <= 1 ? currentStep : currentStep - 1;
  });
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
  public readonly totalDuration = computed(() => {
    const { selectedServices, durationOverrides } = this._state();
    return selectedServices.reduce((acc, s) => {
      const override = durationOverrides[s.id];
      return acc + (override !== undefined ? override : s.duration);
    }, 0);
  });
  public getEffectiveDuration(serviceId: number): number {
    const { selectedServices, durationOverrides } = this._state();
    const override = durationOverrides[serviceId];
    if (override !== undefined) return override;
    return selectedServices.find(s => s.id === serviceId)?.duration ?? 0;
  }
  public getEffectivePrice(serviceId: number): number {
    const { selectedServices, priceOverrides } = this._state();
    const override = priceOverrides[serviceId];
    if (override !== undefined) return override;
    return selectedServices.find(s => s.id === serviceId)?.price ?? 0;
  }
  public init(userRole: WizardRole, currentUserId: number): void {
    this._state.set({ ...INITIAL_STATE, userRole, currentUserId });
  }
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
  public setSelectedWorkerForAppointment(worker: ListUserItem | null): void {
    this._state.update(s => ({ ...s, selectedWorkerForAppointment: worker }));
  }
  public setSelectedDateTime(dateTime: Date | null): void {
    this._state.update(s => ({ ...s, selectedDateTime: dateTime }));
  }
  public setNotes(notes: string): void {
    this._state.update(s => ({ ...s, notes }));
  }
  public reset(): void {
    this._state.set({ ...INITIAL_STATE });
  }
}
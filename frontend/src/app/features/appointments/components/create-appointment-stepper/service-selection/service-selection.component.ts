import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServicesService } from '../../../../services/services/services.service';
import { UserService } from '../../../../users/services/user.service';
import { MessageService } from '../../../../../core/services/message.service';
import { AlertType } from '../../../../../core/utils/enums/AlertType';
import { AppointmentCreateService, MAX_SERVICES } from '../../../services/appointment-create.service';
import { ServiceSearchComponent } from './service-search/service-search.component';
import { WorkerSearchComponent } from './worker-search/worker-search.component';
import { Service } from '../../../../../shared/models/entities/service.schema';
import { ListUserItem } from '../../../../users/models/responses/list-users-response.model';
import { ServicesListResponse } from '../../../../services/models/responses/services-list-response.model';
import { ListUsersResponse } from '../../../../users/models/responses/list-users-response.model';
import { ErrorResponse } from '../../../../../shared/models/api/error-response.schema';
import { Meta } from '../../../../../shared/models/entities/entity-base.schema';
import { appointmentDurationValidator } from '../../../validators/update-service-duration.validators';
import { appointmentPriceValidator } from '../../../validators/update-service-price.validators';
import { formatDuration } from '../../../utils/appointments-format.util';
type ActivePanel = 'services' | 'workers';
@Component({
  selector: 'app-service-selection',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule, ServiceSearchComponent, WorkerSearchComponent],
  templateUrl: './service-selection.component.html',
  styleUrl:    './service-selection.component.scss',
})
export class ServiceSelectionComponent implements OnInit, OnDestroy {
  private readonly servicesService = inject(ServicesService);
  private readonly userService     = inject(UserService);
  private readonly messageService  = inject(MessageService);
  private readonly fb              = inject(FormBuilder);
  public  readonly wizard          = inject(AppointmentCreateService);
  private readonly destroy$ = new Subject<void>();
  protected services:        Service[] = [];
  protected servicesLoading            = false;
  protected workers:       ListUserItem[] = [];
  protected workersMeta:   Meta = { total: 0, limit: 10, page: 1, totalPages: 1 };
  protected workersLoading               = false;
  private   workersPage                  = 1;
  private   workerSearchTerm             = '';
  protected activePanel = signal<ActivePanel>('services');
  protected durationForm!: FormGroup;
  protected priceForm!: FormGroup;
  protected readonly maxServices = MAX_SERVICES;
  protected hideWorkerName = false;
  protected get isWorker(): boolean {
    return this.wizard.userRole() === 'WORKER';
  }
  protected get selectedServices(): Service[] {
    return this.wizard.selectedServices();
  }
  protected get lockedWorkerId(): number | null {
    return this.wizard.lockedWorkerId();
  }
  protected get canGoNext(): boolean {
    return this.wizard.canGoNext();
  }
  protected get totalPrice(): number    { return this.wizard.totalPrice(); }
  protected get totalDuration(): number { return this.wizard.totalDuration(); }
  protected readonly formatDuration = formatDuration;
  protected get lockedWorkerName(): string | null {
    if (!this.lockedWorkerId) return null;
    const w = this.workers.find(u => u.id === this.lockedWorkerId);
    if (w) return `${w.firstName} ${w.lastName}`;
    const svc = this.selectedServices[0];
    return svc ? svc.worker.name : null;
  }
  protected get toggleBtnLabel(): string {
    if (this.lockedWorkerId !== null) return 'Quitar selección';
    if (this.activePanel() === 'workers') return 'Seleccionar servicios';
    return 'Seleccionar estilista';
  }
  protected get toggleBtnIcon(): string {
    if (this.lockedWorkerId !== null) return 'person_remove';
    if (this.activePanel() === 'workers') return 'content_cut';
    return 'person_search';
  }
  public ngOnInit(): void {
    this.durationForm = this.fb.group({});
    this.priceForm    = this.fb.group({});
    this.hideWorkerName = this.wizard.userRole() === 'WORKER';
    const locked = this.wizard.lockedWorkerId();
    if (locked !== null) {
      this.loadServicesByWorker(locked);
    } else {
      this.loadServices();
    }
    if (this.isWorker) {
      this.syncDurationFormWithServices();
      this.syncPriceFormWithServices();
    }
  }
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private syncDurationFormWithServices(): void {
    const services = this.wizard.selectedServices();
    const currentKeys = Object.keys(this.durationForm.controls);
    const newKeys = services.map(s => String(s.id));
    currentKeys.forEach(key => {
      if (!newKeys.includes(key)) {
        this.durationForm.removeControl(key);
      }
    });
    services.forEach(svc => {
      const key = String(svc.id);
      if (!this.durationForm.contains(key)) {
        const override = this.wizard.durationOverrides()[svc.id];
        const initialValue = override !== undefined ? override : svc.duration;
        this.durationForm.addControl(
          key,
          this.fb.control(initialValue, [
            appointmentDurationValidator(),
          ])
        );
      }
    });
  }
  protected getDurationError(serviceId: number): string {
    const control = this.durationForm.get(String(serviceId));
    if (!control || !control.touched || !control.errors) return '';
    if (control.errors['duration']) return control.errors['duration'];
    return '';
  }
  private syncPriceFormWithServices(): void {
    const services = this.wizard.selectedServices();
    const currentKeys = Object.keys(this.priceForm.controls);
    const newKeys = services.map(s => String(s.id));
    currentKeys.forEach(key => {
      if (!newKeys.includes(key)) {
        this.priceForm.removeControl(key);
      }
    });
    services.forEach(svc => {
      const key = String(svc.id);
      if (!this.priceForm.contains(key)) {
        const override = this.wizard.priceOverrides()[svc.id];
        const initialValue = override !== undefined ? override : svc.price;
        this.priceForm.addControl(
          key,
          this.fb.control(initialValue, [appointmentPriceValidator()])
        );
      }
    });
  }
  protected getPriceError(serviceId: number): string {
    const control = this.priceForm.get(String(serviceId));
    if (!control || !control.touched || !control.errors) return '';
    if (control.errors['price']) return control.errors['price'];
    return '';
  }
  protected onPriceInput(serviceId: number): void {
    const control = this.priceForm.get(String(serviceId));
    if (!control) return;
    const parsed = Number(control.value);
    if (!isNaN(parsed) && control.valid) {
      this.wizard.setPriceOverride(serviceId, parsed);
    }
  }
  protected onDurationKeydown(event: KeyboardEvent): void {
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowed.includes(event.key) || event.ctrlKey || event.metaKey || /^\d$/.test(event.key)) return;
    event.preventDefault();
  }
  protected onDurationInput(serviceId: number): void {
    const control = this.durationForm.get(String(serviceId));
    if (!control) return;
    const parsed = Number(control.value);
    if (!isNaN(parsed) && control.valid) {
      this.wizard.setDurationOverride(serviceId, parsed);
    }
  }
  private loadServices(): void {
    this.servicesLoading = true;
    const filters = this.isWorker
      ? { workerId: this.wizard.currentUserId(), isActive: true }
      : { isActive: true };
    this.servicesService.getServices(filters).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next:  r => this.handleServicesSuccess(r),
      error: e => this.handleServicesError(e),
    });
  }
  private loadServicesByWorker(workerId: number): void {
    this.servicesLoading = true;
    this.servicesService.getServices({ workerId, isActive: true }).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next:  r => this.handleServicesSuccess(r),
      error: e => this.handleServicesError(e),
    });
  }
  private handleServicesSuccess(r: ServicesListResponse): void {
    this.services        = r.data;
    this.servicesLoading = false;
  }
  private handleServicesError(e: ErrorResponse): void {
    this.servicesLoading = false;
    this.messageService.showMessage(e.message, AlertType.ERROR);
  }
  private loadWorkers(): void {
    this.workersLoading = true;
    this.userService.getUsers({
      page:       this.workersPage,
      role:       'WORKER',
      isActive:   true,
      identifier: this.workerSearchTerm || undefined,
    }).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next:  r => this.handleWorkersSuccess(r),
      error: e => this.handleWorkersError(e),
    });
  }
  private handleWorkersSuccess(r: ListUsersResponse): void {
    this.workers        = r.data;
    this.workersMeta    = r.meta;
    this.workersLoading = false;
  }
  private handleWorkersError(e: ErrorResponse): void {
    this.workersLoading = false;
    this.messageService.showMessage(e.message, AlertType.ERROR);
  }
  protected onServiceSelected(service: Service): void {
    if (!service.isActive) return;
    if (this.wizard.isServiceSelected(service.id)) return;
    const locked = this.lockedWorkerId;
    if (locked !== null && service.worker.id !== locked) {
      this.messageService.showMessage(
        'Solo puedes seleccionar servicios del mismo estilista en una cita.',
        AlertType.ERROR,
      );
      return;
    }
    if (this.selectedServices.length >= MAX_SERVICES) {
      this.messageService.showMessage(
        `Puedes seleccionar un máximo de ${MAX_SERVICES} servicios por cita.`,
        AlertType.ERROR,
      );
      return;
    }
    this.wizard.addService(service);
    if (this.wizard.selectedServices().length === 1) {
      this.loadServicesByWorker(service.worker.id);
    }
    if (this.isWorker) {
      this.syncDurationFormWithServices();
      this.syncPriceFormWithServices();
    }
  }
  protected onWorkerSelected(worker: ListUserItem): void {
    this.wizard.lockWorker(worker.id);
    this.activePanel.set('services');
    this.loadServicesByWorker(worker.id);
  }
  protected onWorkerSearchChanged(term: string): void {
    this.workerSearchTerm = term;
    this.workersPage      = 1;
    this.loadWorkers();
  }
  protected onWorkersPageChange(page: number): void {
    this.workersPage = page;
    this.loadWorkers();
  }
  protected onRemoveService(serviceId: number): void {
    this.wizard.removeService(serviceId);
    if (this.isWorker) {
      this.syncDurationFormWithServices();
      this.syncPriceFormWithServices();
    }
    if (this.wizard.selectedServices().length === 0) {
      this.loadServices();
    }
  }
  protected onTogglePanel(): void {
    if (this.lockedWorkerId !== null) {
      this.wizard.clearWorkerLock();
      this.activePanel.set('services');
      if (this.isWorker) {
        this.syncDurationFormWithServices();
        this.syncPriceFormWithServices();
      }
      this.loadServices();
      return;
    }
    if (this.activePanel() === 'services') {
      this.activePanel.set('workers');
      if (this.workers.length === 0) this.loadWorkers();
    } else {
      this.activePanel.set('services');
    }
  }
  public onNext(): void {
    if (!this.canGoNext) return;
    if (this.isWorker && this.selectedServices.length > 0) {
      this.durationForm.markAllAsTouched();
      this.priceForm.markAllAsTouched();
      if (this.durationForm.invalid || this.priceForm.invalid) {
        this.messageService.showMessage(
          'Porfavor completa los campos requeridos correctamente.',
          AlertType.WARNING,
        );
        return;
      }
      this.selectedServices.forEach(svc => {
        const durationCtrl = this.durationForm.get(String(svc.id));
        if (durationCtrl?.valid) {
          const val = Number(durationCtrl.value);
          this.wizard.setDurationOverride(svc.id, val !== svc.duration ? val : null);
        }
        const priceCtrl = this.priceForm.get(String(svc.id));
        if (priceCtrl?.valid) {
          const val = Number(priceCtrl.value);
          this.wizard.setPriceOverride(svc.id, val !== svc.price ? val : null);
        }
      });
    }
    this.wizard.nextStep();
  }
}
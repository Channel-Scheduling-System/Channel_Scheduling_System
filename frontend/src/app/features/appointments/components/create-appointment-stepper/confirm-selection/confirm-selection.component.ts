import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppointmentCreateService } from '../../../services/appointment-create.service';
import { AppointmentsService } from '../../../../appointments/services/appointments.service';
import { MessageService } from '../../../../../core/services/message.service';
import { AlertType } from '../../../../../core/utils/enums/AlertType';
import { FabService } from '../../../../../core/services/fab.services';
import { TemplatePortal } from '@angular/cdk/portal';
import { appointmentNotesValidator } from '../../../validators/appointment-notes.validators';
import { Service } from '../../../../../shared/models/entities/service.schema';
import { ErrorResponse } from '../../../../../shared/models/api/error-response.schema';
@Component({
  selector: 'app-confirm-selection',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule],
  templateUrl: './confirm-selection.component.html',
  styleUrl: './confirm-selection.component.scss',
})
export class ConfirmSelectionComponent implements OnInit, OnDestroy {
  public  readonly wizard              = inject(AppointmentCreateService);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly messageService      = inject(MessageService);
  private readonly fabService          = inject(FabService);
  private readonly router              = inject(Router);
  private readonly route               = inject(ActivatedRoute);
  private readonly fb                  = inject(FormBuilder);
  private readonly vcr                 = inject(ViewContainerRef);
  private readonly destroy$ = new Subject<void>();
  @ViewChild('confirmFabTemplate') private confirmFabTemplate!: TemplateRef<any>;
  protected notesControl!: FormControl;
  protected isSubmitting = signal(false);
  protected get isWorker(): boolean {
    return this.wizard.userRole() === 'WORKER';
  }
  protected get selectedServices(): Service[] {
    return this.wizard.selectedServices();
  }
  protected get totalPrice(): number {
    return this.wizard.totalPrice();
  }
  protected get totalDuration(): number {
    return this.wizard.totalDuration();
  }
  protected get workerName(): string {
    const svc = this.selectedServices[0];
    if (!svc) return '—';
    return svc.worker?.name ?? '—';
  }
  protected get clientName(): string {
    const client = this.wizard.selectedWorkerForAppointment();
    if (!client) return '—';
    return `${client.firstName} ${client.lastName}`;
  }
  protected get formattedDate(): string {
    const dt = this.wizard.selectedDateTime();
    if (!dt) return '—';
    return dt.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  protected get formattedTime(): string {
    const dt = this.wizard.selectedDateTime();
    if (!dt) return '—';
    return dt.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  protected get formattedEndTime(): string {
    const dt = this.wizard.selectedDateTime();
    if (!dt) return '—';
    const end = new Date(dt.getTime() + this.totalDuration * 60_000);
    return end.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  protected getEffectiveDuration(svc: Service): number {
    return this.wizard.getEffectiveDuration(svc.id);
  }
  protected getEffectivePrice(svc: Service): number {
    return this.wizard.getEffectivePrice(svc.id);
  }
  public ngOnInit(): void {
    this.notesControl = this.fb.control(
      this.wizard.notes() ?? '',
      [appointmentNotesValidator()]
    );
  }
  public ngAfterViewInit(): void {
    this.fabService.set(
      new TemplatePortal(this.confirmFabTemplate, this.vcr)
    );
  }
  public ngOnDestroy(): void {
    this.destroy$.complete();
  }
  protected get notesError(): string {
    if (!this.notesControl.touched || !this.notesControl.errors) return '';
    return this.notesControl.errors['notes'] ?? '';
  }
  protected get notesLength(): number {
    return (this.notesControl.value ?? '').length;
  }
  protected onSubmit(): void {
    this.notesControl.markAsTouched();
    if (this.notesControl.invalid) {
      this.messageService.showMessage(
        'Porfavor completa el campo correctamente.',
        AlertType.WARNING,
      );
      return;
    }
    if (this.isSubmitting()) return;
    const dt = this.wizard.selectedDateTime();
    if (!dt) {
      this.messageService.showMessage(
        'No se ha seleccionado una fecha y hora.',
        AlertType.ERROR,
      );
      return;
    }
    this.wizard.setNotes(this.notesControl.value ?? '');
    const pad  = (n: number) => String(n).padStart(2, '0');
    const y    = dt.getFullYear();
    const mo   = pad(dt.getMonth() + 1);
    const d    = pad(dt.getDate());
    const hh   = pad(dt.getHours());
    const mm   = pad(dt.getMinutes());
    const startAt = `${y}-${mo}-${d}T${hh}:${mm}Z`;
    const lockedWorkerId = this.wizard.lockedWorkerId();
    const workerId = lockedWorkerId ?? this.wizard.currentUserId();
    let clientId: number;
    if (this.isWorker) {
      const client = this.wizard.selectedWorkerForAppointment();
      clientId = client?.id ?? 0;
    } else {
      clientId = this.wizard.currentUserId();
    }
    const services = this.selectedServices.map(svc => ({
      serviceId:      svc.id,
      customDuration: this.wizard.getEffectiveDuration(svc.id),
      customPrice:    this.wizard.getEffectivePrice(svc.id),
    }));
    const request = {
      workerId,
      clientId,
      startAt,
      services,
      notes: this.notesControl.value || undefined,
    };
    this.isSubmitting.set(true);
    this.appointmentsService.createAppointment(request).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next:  r  => this.handleSuccess(r),
      error: e  => this.handleError(e),
    });
  }
  private handleSuccess(response: any): void {
    this.messageService.showMessage(
      response?.message ?? 'Cita agendada exitosamente.',
      AlertType.SUCCESS,
    );
    setTimeout(() => {
      this.router.navigate(['..'], { relativeTo: this.route });
    }, 1000);
  }
  private handleError(e: ErrorResponse): void {
    this.isSubmitting.set(false);
    this.messageService.showMessage(
      e?.message ?? 'Ocurrió un error al agendar la cita.',
      AlertType.ERROR,
    );
  }
  protected formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
}
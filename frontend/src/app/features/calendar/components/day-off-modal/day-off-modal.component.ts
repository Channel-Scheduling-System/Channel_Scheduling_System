import {
  Component,
  ComponentRef,
  inject,
  Inject,
  Injector,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DATE_PICKER_SEED, DatePickerComponent } from '../../../../core/components/date-picker/date-picker.component';
import { dayOffFieldValidator } from '../../validators/day-off-modal.validators';
import type { DayOffModalData } from '../../interfaces/calendar-modal-data.interface';
import { SetDayOffRequest } from '../../models/requests/set-day-off-request.model';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
const MONTHS_SHORT_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];
@Component({
  selector: 'app-day-off-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './day-off-modal.component.html',
  styleUrls: ['./day-off-modal.component.scss'],
})
export class DayOffModalComponent implements OnInit, OnDestroy {
  protected form!: FormGroup;
  protected isSubmitting = false;
  protected activeDatePicker = false;
  private readonly injector    = inject(Injector);
  private _dateOverlayRef: OverlayRef | null = null;
  private _datePickerRef: ComponentRef<DatePickerComponent> | null = null;
  public constructor(
    private readonly fb:        FormBuilder,
    private readonly dialogRef: MatDialogRef<DayOffModalComponent>,
    private readonly overlay:   Overlay,
    private readonly messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public readonly data: DayOffModalData,
  ) {}
  public ngOnInit(): void {
    this.buildForm();
  }
  public ngOnDestroy(): void {
    this._closeDateOverlay();
  }
  private buildForm(): void {
    const defaultDate = this.data.day ? this.formatDate(this.data.day) : '';
    this.form = this.fb.group({
      date: [defaultDate, [Validators.required, dayOffFieldValidator('date')]],
      reason: ['', [dayOffFieldValidator('reason')]],
    });
  }
  protected openDatePicker(e: MouseEvent): void {
    e.stopPropagation();
    if (this.activeDatePicker) { this._closeDateOverlay(); return; }
    this.activeDatePicker = true;
    const seed = (this.form.get('date')?.value ?? '') as string;
    this._dateOverlayRef = this._createOverlay();
    this._attachDatePicker(this._dateOverlayRef, seed);
  }
  private _createOverlay(): OverlayRef {
    const ref = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy:   this.overlay.scrollStrategies.reposition(),
      hasBackdrop:      true,
      backdropClass:    'cdk-overlay-transparent-backdrop',
    });
    ref.backdropClick().subscribe(() => this._closeDateOverlay());
    return ref;
  }
  private _attachDatePicker(overlayRef: OverlayRef, seed: string): void {
    const inj = Injector.create({
      providers: [{ provide: DATE_PICKER_SEED, useValue: seed }],
      parent: this.injector,
    });
    const portal = new ComponentPortal(DatePickerComponent, null, inj);
    const ref    = overlayRef.attach(portal);
    this._datePickerRef = ref;
    ref.instance.label = 'Día libre';
    ref.changeDetectorRef.detectChanges();
    ref.instance.confirmed.subscribe((val: string) => {
      const ctrl = this.form.get('date')!;
      ctrl.setValue(val);
      ctrl.markAsTouched();
      this._closeDateOverlay();
    });
    ref.instance.cancelled.subscribe(() => this._closeDateOverlay());
  }
  private _closeDateOverlay(): void {
    this._dateOverlayRef?.dispose();
    this._dateOverlayRef = null;
    this._datePickerRef  = null;
    this.activeDatePicker = false;
  }
  protected getFieldError(field: string): string {
    const ctrl = this.form.get(field);
    return this.getControlError(ctrl, field);
  }
  protected displayDate(value: string | null | undefined): string {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Selecciona la fecha';
    const [y, m, d] = value.split('-').map(Number);
    return `${String(d).padStart(2, '0')} ${MONTHS_SHORT_ES[m - 1]} ${y}`;
  }
  protected get reasonLength(): number {
    return (this.form.get('reason')?.value as string)?.length ?? 0;
  }
  protected onSubmit(): void {
    this._closeDateOverlay();
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.showMessage('Por favor completa el campo requerido correctamente', AlertType.WARNING);
      return;
    }
    this.isSubmitting = true;
    const v       = this.form.value as Record<string, string>;
    const request: SetDayOffRequest = {
      date: v['date'],
      ...(v['reason']?.trim() ? { reason: v['reason'] } : {}),
    };
    this.data.onSubmit(request);
  }
  public setSubmitting(value: boolean): void { this.isSubmitting = value; }
  public close(): void { this.dialogRef.close(); }
  protected onCancel(): void { this.dialogRef.close(); }
  private formatDate(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }
  private getControlError(ctrl: AbstractControl | null, fieldName: string): string {
    if (!ctrl?.touched || !ctrl.errors) return '';
    if (ctrl.errors['required']) return 'Este campo es obligatorio';
    const direct = ctrl.errors[fieldName];
    if (typeof direct === 'string') return direct;
    const firstKey = Object.keys(ctrl.errors)[0];
    const first = firstKey ? ctrl.errors[firstKey] : '';
    return typeof first === 'string' ? first : '';
  }
}
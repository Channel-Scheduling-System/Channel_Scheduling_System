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
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DATE_PICKER_SEED, DatePickerComponent } from '../date-picker/date-picker.component';
import type { SetDayOffRequest } from '../../models/requests/set-day-off-request.model';

// ── Public data interface ─────────────────────────────────────────────────────

export interface DayOffModalData {
  day?: Date;
  onSubmit: (request: SetDayOffRequest) => void;
}

// ── Inline date-format validator (reuses same pattern as Zod schema) ──────────

function dateFormatValidator(): ValidatorFn {
  return (ctrl: AbstractControl): ValidationErrors | null => {
    const v = (ctrl.value ?? '').toString().trim();
    if (!v) return null;
    return /^\d{4}-\d{2}-\d{2}$/.test(v)
      ? null
      : { dateFormat: 'Formato inválido — use AAAA-MM-DD' };
  };
}

// ── Month abbreviations for display ──────────────────────────────────────────

const MONTHS_SHORT_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

// ── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-day-off-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePickerComponent],
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
    @Inject(MAT_DIALOG_DATA) public readonly data: DayOffModalData,
  ) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  public ngOnInit(): void {
    this.buildForm();
  }

  public ngOnDestroy(): void {
    this._closeDateOverlay();
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  private buildForm(): void {
    const defaultDate = this.data.day ? this.formatDate(this.data.day) : '';
    this.form = this.fb.group({
      date:   [defaultDate, [Validators.required, dateFormatValidator()]],
      reason: ['',          [Validators.maxLength(200)]],
    });
  }

  // ── Date picker overlay ───────────────────────────────────────────────────

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

  // ── Error helpers ─────────────────────────────────────────────────────────

  protected getFieldError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched || !ctrl.errors) return '';
    if (ctrl.errors['required'])   return 'Campo requerido';
    if (ctrl.errors['dateFormat']) return ctrl.errors['dateFormat'] as string;
    if (ctrl.errors['maxlength'])  return 'Máximo 200 caracteres';
    return '';
  }

  // ── Display helpers ───────────────────────────────────────────────────────

  protected displayDate(value: string | null | undefined): string {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Selecciona la fecha';
    const [y, m, d] = value.split('-').map(Number);
    return `${String(d).padStart(2, '0')} ${MONTHS_SHORT_ES[m - 1]} ${y}`;
  }

  protected get reasonLength(): number {
    return (this.form.get('reason')?.value as string)?.length ?? 0;
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  protected onSubmit(): void {
    this._closeDateOverlay();
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.isSubmitting = true;

    const v       = this.form.value as Record<string, string>;
    const request: SetDayOffRequest = {
      date: v['date'],
      ...(v['reason']?.trim() ? { reason: v['reason'] } : {}),
    };
    this.data.onSubmit(request);
  }

  // ── Public API (for CalendarComponent) ───────────────────────────────────

  public setSubmitting(value: boolean): void { this.isSubmitting = value; }
  public close(): void { this.dialogRef.close(); }
  protected onCancel(): void { this.dialogRef.close(); }

  // ── Utils ─────────────────────────────────────────────────────────────────

  private formatDate(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }
}
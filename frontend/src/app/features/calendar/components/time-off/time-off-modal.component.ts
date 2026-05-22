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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { formatTimeTo12Hour } from '../../utils/time.util';
import { timeFormatValidator, endAfterStartGroupValidator } from '../../validators/working-hours.validators';
import { TIME_PICKER_SEED, TimePickerComponent } from '../time-picker/time-picker.component';
import type { SetTimeOffRequest } from '../../models/requests/set-time-off-request.model';
import type { TimeSlot } from '../../interfaces/time-slot.interface';
import { DatePickerComponent, DATE_PICKER_SEED } from '../date-picker/date-picker.component';

export interface TimeOffModalData {
  day?: Date;
  startSlot?: TimeSlot;
  endSlot?: TimeSlot;
  onSubmit: (request: SetTimeOffRequest) => void;
}

type BlockType = 'RECURRING' | 'SPECIFIC';

const WEEKDAY_OPTIONS = [
  { value: 'MONDAY', label: 'Lunes' },
  { value: 'TUESDAY', label: 'Martes' },
  { value: 'WEDNESDAY', label: 'Miércoles' },
  { value: 'THURSDAY', label: 'Jueves' },
  { value: 'FRIDAY', label: 'Viernes' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
];

@Component({
  selector: 'app-time-off-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './time-off-modal.component.html',
  styleUrls: ['./time-off-modal.component.scss'],
})
export class TimeOffModalComponent implements OnInit, OnDestroy {

  protected form!: FormGroup;
  protected isSubmitting = false;
  protected readonly weekdayOptions = WEEKDAY_OPTIONS;
  protected activePicker: 'startTime' | 'endTime' | null = null;

  private readonly injector = inject(Injector);
  private _overlayRef: OverlayRef | null = null;
  private _pickerRef: ComponentRef<any> | null = null;
  protected selectOpen = false;
  protected weekdaySelectOpen = false;

  public constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<TimeOffModalComponent>,
    private readonly overlay: Overlay,
    @Inject(MAT_DIALOG_DATA) public readonly data: TimeOffModalData,
  ) { }

  public ngOnInit(): void {
    this.buildForm();
  }

  public ngOnDestroy(): void {
    this._closeOverlay();
  }

  private buildForm(): void {
    const defaultDate = this.data.day ? this.formatDate(this.data.day) : '';
    const defaultDayOfWeek = this.data.day ? this.getDayOfWeek(this.data.day) : 'MONDAY';
    const defaultStart = this.slotToTimeStr(this.data.startSlot);
    const defaultEnd = this.slotToEndTimeStr(this.data.endSlot);

    this.form = this.fb.group(
      {
        type: ['SPECIFIC'],
        date: [defaultDate, [Validators.required]],
        dayOfWeek: [defaultDayOfWeek],
        startTime: [defaultStart, [Validators.required, timeFormatValidator()]],
        endTime: [defaultEnd, [Validators.required, timeFormatValidator()]],
        reason: ['', [Validators.maxLength(200)]],
      },
      { validators: endAfterStartGroupValidator() },
    );

    this.form.get('type')!.valueChanges.subscribe(() => this.syncDateValidators());
    this.syncDateValidators();
  }

  protected onSelectChange(): void {
    this.selectOpen = false;
  }

  protected get selectedWeekdayLabel(): string {
    const val = this.form.get('dayOfWeek')?.value as string;
    return WEEKDAY_OPTIONS.find(d => d.value === val)?.label ?? 'Selecciona un día';
  }

  private syncDateValidators(): void {
    const type = this.form.get('type')!.value as BlockType;
    const dateCtrl = this.form.get('date')!;
    const weekdayCtrl = this.form.get('dayOfWeek')!;

    if (type === 'SPECIFIC') {
      dateCtrl.setValidators([Validators.required]);
      weekdayCtrl.clearValidators();
    } else {
      weekdayCtrl.setValidators([Validators.required]);
      dateCtrl.clearValidators();
    }
    dateCtrl.updateValueAndValidity({ emitEvent: false });
    weekdayCtrl.updateValueAndValidity({ emitEvent: false });
  }

  protected get blockType(): BlockType {
    return this.form.get('type')!.value as BlockType;
  }

  protected openPicker(field: 'startTime' | 'endTime', e: MouseEvent): void {
    e.stopPropagation();

    if (this.activePicker === field) { this._closeOverlay(); return; }

    this._closeOverlay();
    this.activePicker = field;

    const seed = (this.form.get(field)?.value ?? '') as string;
    const label = field === 'startTime' ? 'Hora de inicio' : 'Hora de fin';

    this._overlayRef = this._createOverlay();
    this._pickerRef = this._attachPicker(this._overlayRef, seed, label);
  }

  private _createOverlay(): OverlayRef {
    const ref = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });
    ref.backdropClick().subscribe(() => this._closeOverlay());
    return ref;
  }

  private _attachPicker(
    overlayRef: OverlayRef,
    seed: string,
    label: string,
  ): ComponentRef<TimePickerComponent> {
    const inj = Injector.create({ providers: [{ provide: TIME_PICKER_SEED, useValue: seed }], parent: this.injector });
    const portal = new ComponentPortal(TimePickerComponent, null, inj);
    const ref = overlayRef.attach(portal);

    ref.instance.label = label;
    ref.changeDetectorRef.detectChanges();
    ref.instance.confirmed.subscribe(v => { this._onPickerConfirmed(v); this._closeOverlay(); });
    ref.instance.cancelled.subscribe(() => this._closeOverlay());
    return ref;
  }

  private _onPickerConfirmed(value: string): void {
    if (!this.activePicker) return;
    const ctrl = this.form.get(this.activePicker)!;
    ctrl.setValue(value);
    ctrl.markAsTouched();
    this.activePicker = null;
  }

  private _closeOverlay(): void {
    this._overlayRef?.dispose();
    this._overlayRef = null;
    this._pickerRef = null;
    this.activePicker = null;
    this.selectOpen = false;
    this.weekdaySelectOpen = false;
  }

  protected openDatePicker(e: MouseEvent): void {
    e.stopPropagation();
    if (this.activePicker === ('date' as any)) { this._closeOverlay(); return; }
    this._closeOverlay();
    (this.activePicker as any) = 'date';

    const seed = (this.form.get('date')?.value ?? '') as string;
    this._overlayRef = this._createOverlay();

    const inj = Injector.create({
      providers: [{ provide: DATE_PICKER_SEED, useValue: seed }],
      parent: this.injector,
    });
    const portal = new ComponentPortal(DatePickerComponent, null, inj);
    const ref = this._overlayRef.attach(portal);

    ref.instance.label = 'Seleccionar fecha';
    ref.changeDetectorRef.detectChanges();
    ref.instance.confirmed.subscribe((val: string) => {
      const ctrl = this.form.get('date')!;
      ctrl.setValue(val);
      ctrl.markAsTouched();
      this._closeOverlay();
    });
    ref.instance.cancelled.subscribe(() => this._closeOverlay());
    this._pickerRef = ref;
  }

  protected displayDate(value: string | null | undefined): string {
    if (!value) return 'Selecciona la fecha';
    const [y, m, d] = value.split('-').map(Number);
    const months = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.',
      'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'];
    return `${d} ${months[m - 1]} ${y}`;
  }

  protected closeDropdowns(): void {
    this.selectOpen = false;
    this.weekdaySelectOpen = false;
  }

  

  protected getFieldError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched || !ctrl.errors) return '';
    if (ctrl.errors['required']) return 'Campo requerido';
    if (ctrl.errors['timeFormat']) return ctrl.errors['timeFormat'] as string;
    if (ctrl.errors['maxlength']) return 'Máximo 200 caracteres';
    return '';
  }

  protected getCrossTimeError(): string {
    const hasError = this.form.errors?.['endAfterStart'];
    const startTouched = this.form.get('startTime')?.touched;
    const endTouched = this.form.get('endTime')?.touched;
    return (hasError && startTouched && endTouched)
      ? (this.form.errors!['endAfterStart'] as string)
      : '';
  }

  protected get reasonLength(): number {
    return (this.form.get('reason')?.value as string)?.length ?? 0;
  }

  protected display12h(value: string | null | undefined): string {
    if (!value) return 'Selecciona la hora';
    return formatTimeTo12Hour(value);
  }

  protected onSubmit(): void {
    this._closeOverlay();
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.isSubmitting = true;
    this.data.onSubmit(this.buildRequest());
  }

  private buildRequest(): SetTimeOffRequest {
    const v = this.form.value as Record<string, string>;
    const base = {
      startTime: v['startTime'],
      endTime: v['endTime'],
      ...(v['reason']?.trim() ? { reason: v['reason'] } : {}),
    };
    return v['type'] === 'RECURRING'
      ? { type: 'RECURRING', dayOfWeek: v['dayOfWeek'] as any, ...base }
      : { type: 'SPECIFIC', date: v['date'], ...base };
  }

  public setSubmitting(value: boolean): void { this.isSubmitting = value; }

  protected onCancel(): void { this.dialogRef.close(); }

  

  private formatDate(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }

  private getDayOfWeek(date: Date): string {
    return ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][date.getDay()];
  }

  private slotToTimeStr(slot?: TimeSlot): string {
    if (!slot) return '';
    return `${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')}`;
  }

  private slotToEndTimeStr(slot?: TimeSlot): string {
    if (!slot) return '';
    const total = slot.hour * 60 + slot.minute + 30;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }
}
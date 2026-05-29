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
import { timeOffFieldValidator, timeOffGroupValidator } from '../../validators/time-off-modal.validators';
import { TIME_PICKER_SEED, TimePickerComponent } from '../time-picker/time-picker.component';
import { DatePickerComponent, DATE_PICKER_SEED } from '../date-picker/date-picker.component';
import type { TimeOffModalData } from '../../interfaces/calendar-modal-data.interface';
import type { TimeOffBlockType } from '../../types/time-off.types';
import type { TimeSlot } from '../../interfaces/time-slot.interface';
import type { SetTimeOffRequest } from '../../models/requests/set-time-off-request.model';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { formatTimeTo12h } from '../../../../core/utils/time.util';
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
    private readonly messageService: MessageService,
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
    const typeGetter = () => this.getFormType();
    this.form = this.fb.group(
      {
        type: ['SPECIFIC'],
        date: [defaultDate, [Validators.required, timeOffFieldValidator('date', typeGetter)]],
        dayOfWeek: [defaultDayOfWeek, [Validators.required, timeOffFieldValidator('dayOfWeek', typeGetter)]],
        startTime: [defaultStart, [Validators.required, timeOffFieldValidator('startTime', typeGetter)]],
        endTime: [defaultEnd, [Validators.required, timeOffFieldValidator('endTime', typeGetter)]],
        reason: ['', [timeOffFieldValidator('reason', typeGetter)]],
      },
      { validators: timeOffGroupValidator(typeGetter) },
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
    const typeGetter = () => this.getFormType();
    const dateCtrl = this.form.get('date')!;
    const weekdayCtrl = this.form.get('dayOfWeek')!;
    if (this.getFormType() === 'SPECIFIC') {
      dateCtrl.setValidators([Validators.required, timeOffFieldValidator('date', typeGetter)]);
      weekdayCtrl.setValidators([timeOffFieldValidator('dayOfWeek', typeGetter)]);
    } else {
      weekdayCtrl.setValidators([Validators.required, timeOffFieldValidator('dayOfWeek', typeGetter)]);
      dateCtrl.setValidators([timeOffFieldValidator('date', typeGetter)]);
    }
    dateCtrl.updateValueAndValidity({ emitEvent: false });
    weekdayCtrl.updateValueAndValidity({ emitEvent: false });
    this.form.updateValueAndValidity({ emitEvent: false });
  }
  protected get blockType(): TimeOffBlockType {
    return this.form.get('type')!.value as TimeOffBlockType;
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
    return this.getControlError(ctrl, field);
  }
  protected getCrossTimeError(): string {
    const startTouched = this.form.get('startTime')?.touched;
    const endTouched = this.form.get('endTime')?.touched;
    const msg = this.form.errors?.['endTime'];
    return (startTouched && endTouched && typeof msg === 'string') ? msg : '';
  }
  protected get reasonLength(): number {
    return (this.form.get('reason')?.value as string)?.length ?? 0;
  }
  protected display12h(value: string | null | undefined): string {
    if (!value) return 'Selecciona la hora';
    return formatTimeTo12h(value);
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
  private getFormType(): TimeOffBlockType {
    return (this.form?.get('type')?.value as TimeOffBlockType) ?? 'SPECIFIC';
  }
  protected onSubmit(): void {
    this._closeOverlay();
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.showMessage('Porfavor completa los campos requeridos correctamente', AlertType.WARNING);
      return;
    }
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
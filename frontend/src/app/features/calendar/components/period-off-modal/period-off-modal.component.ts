import {
    Component, ComponentRef, inject, Inject, Injector, OnDestroy, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DATE_PICKER_SEED, DatePickerComponent } from '../../../../core/components/date-picker/date-picker.component';
import { periodOffFieldValidator, periodOffGroupValidator } from '../../validators/period-off-modal.validators';
import type { PeriodOffModalData } from '../../interfaces/calendar-modal-data.interface';
import { SetPeriodOffRequest } from '../../models/requests/set-period-off-request.model';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { MessageService } from '../../../../core/services/message.service';
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MONTHS_SHORT_ES = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];
@Component({
    selector: 'app-period-off-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './period-off-modal.component.html',
    styleUrls: ['./period-off-modal.component.scss'],
})
export class PeriodOffModalComponent implements OnInit, OnDestroy {
    protected form!: FormGroup;
    protected isSubmitting = false;
    protected activeDatePicker: 'startDate' | 'endDate' | null = null;
    private readonly injector = inject(Injector);
    private _overlayRef: OverlayRef | null = null;
    private _pickerRef: ComponentRef<DatePickerComponent> | null = null;
    public constructor(
        private readonly fb: FormBuilder,
        private readonly messageService: MessageService,
        private readonly dialogRef: MatDialogRef<PeriodOffModalComponent>,
        private readonly overlay: Overlay,
        @Inject(MAT_DIALOG_DATA) public readonly data: PeriodOffModalData,
    ) { }
    public ngOnInit(): void { this.buildForm(); }
    public ngOnDestroy(): void { this._closeOverlay(); }
    private buildForm(): void {
        const defaultStart = this.data.startDay ? this._formatDate(this.data.startDay) : '';
        const defaultEnd = this.data.endDay ? this._formatDate(this.data.endDay) : '';
        this.form = this.fb.group(
            {
                startDate: [defaultStart, [Validators.required, periodOffFieldValidator('startDate')]],
                endDate: [defaultEnd, [Validators.required, periodOffFieldValidator('endDate')]],
                reason: ['', [periodOffFieldValidator('reason')]],
            },
            { validators: periodOffGroupValidator() },
        );
        this.form.get('startDate')!.valueChanges.subscribe(() => {
            this.form.updateValueAndValidity();
        });
    }
    protected openDatePicker(field: 'startDate' | 'endDate', e: MouseEvent): void {
        e.stopPropagation();
        if (this.activeDatePicker === field) { this._closeOverlay(); return; }
        this._closeOverlay();
        this.activeDatePicker = field;
        const seed = (this.form.get(field)?.value ?? '') as string;
        const label = field === 'startDate' ? 'Fecha de inicio' : 'Fecha de finalización';
        this._overlayRef = this._createOverlay();
        const inj = Injector.create({
            providers: [{ provide: DATE_PICKER_SEED, useValue: seed }],
            parent: this.injector,
        });
        const ref = this._overlayRef.attach(new ComponentPortal(DatePickerComponent, null, inj));
        this._pickerRef = ref;
        ref.instance.label = label;
        ref.changeDetectorRef.detectChanges();
        ref.instance.confirmed.subscribe((val: string) => {
            const ctrl = this.form.get(field)!;
            ctrl.setValue(val);
            ctrl.markAsTouched();
            this._closeOverlay();
        });
        ref.instance.cancelled.subscribe(() => this._closeOverlay());
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
    private _closeOverlay(): void {
        this._overlayRef?.dispose();
        this._overlayRef = null;
        this._pickerRef = null;
        this.activeDatePicker = null;
    }
    protected getFieldError(field: string): string {
        const ctrl = this.form.get(field);
        return this.getControlError(ctrl, field);
    }
    protected getCrossDateError(): string {
        const endCtrl = this.form.get('endDate');
        const startCtrl = this.form.get('startDate');
        if (!endCtrl?.touched || !endCtrl.value || !startCtrl?.value) return '';
        if (endCtrl.errors) return '';
        const msg = this.form.errors?.['endDate'];
        return typeof msg === 'string' ? msg : '';
    }
    protected displayDate(value: string | null | undefined): string {
        if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Selecciona la fecha';
        const [y, m, d] = value.split('-');
        return `${d}/${m}/${y}`;
    }
    protected get reasonLength(): number {
        return (this.form.get('reason')?.value as string)?.length ?? 0;
    }
    protected onSubmit(): void {
        this._closeOverlay();
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            this.messageService.showMessage('Porfavor completa los campos requeridos correctamente', AlertType.WARNING);
            return;
        }
        this.isSubmitting = true;
        const v = this.form.value as Record<string, string>;
        const request: SetPeriodOffRequest = {
            startDate: v['startDate'],
            endDate: v['endDate'],
            ...(v['reason']?.trim() ? { reason: v['reason'] } : {}),
        };
        this.data.onSubmit(request);
    }
    public setSubmitting(value: boolean): void { this.isSubmitting = value; }
    public close(): void { this.dialogRef.close(); }
    protected onCancel(): void { this.dialogRef.close(); }
    private _formatDate(date: Date): string {
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
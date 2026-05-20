import { Component, ComponentRef, inject, Inject, Injector, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { formatTimeTo12Hour } from '../../utils/time.util';
import type { AvailabilityConfigData } from '../../models/responses/availability-response.model';
import type { UpdateWorkingHoursRequest } from '../../models/requests/update-working-hours-request.model';
import { endAfterStartGroupValidator, timeFormatValidator } from '../../validators/working-hours.validators';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { TIME_PICKER_SEED, TimePickerComponent } from '../time-picker/time-picker.component';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';


export interface WorkingHoursModalData {
    availabilityData: AvailabilityConfigData;
    onSubmit: (request: UpdateWorkingHoursRequest) => void;
}


interface DayRow {
    weekday: string;
    label: string;
    enabled: boolean;
    group: FormGroup;
}


const WEEKDAY_ORDER = [
    'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
] as const;

const WEEKDAY_LABELS: Record<string, string> = {
    MONDAY: 'Lunes',
    TUESDAY: 'Martes',
    WEDNESDAY: 'Miércoles',
    THURSDAY: 'Jueves',
    FRIDAY: 'Viernes',
    SATURDAY: 'Sábado',
    SUNDAY: 'Domingo',
};


@Component({
    selector: 'app-working-hours-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TimePickerComponent],
    templateUrl: './working-hours-modal.component.html',
    styleUrls: ['./working-hours-modal.component.scss'],
})
export class WorkingHoursModalComponent implements OnInit, OnDestroy {

    protected dayRows: DayRow[] = [];
    protected isSubmitting = false;
    private readonly injector = inject(Injector);

    protected activePicker: { rowIdx: number; field: 'startTime' | 'endTime' } | null = null;

    private _overlayRef: OverlayRef | null = null;
    private _pickerRef: ComponentRef<TimePickerComponent> | null = null;

    public constructor(
        private readonly fb: FormBuilder,
        private readonly dialogRef: MatDialogRef<WorkingHoursModalComponent>,
        private readonly messageService: MessageService,
        private readonly overlay: Overlay,
        @Inject(MAT_DIALOG_DATA) public readonly data: WorkingHoursModalData,
    ) { }
    public ngOnDestroy(): void { this._closeOverlay(); }


    public ngOnInit(): void {
        this.buildRows();
    }


    private buildRows(): void {
        const hourMap = new Map(
            (this.data.availabilityData?.workingHours ?? []).map(wh => [wh.dayOfWeek, wh]),
        );

        this.dayRows = WEEKDAY_ORDER.map(weekday => {
            const existing = hourMap.get(weekday);
            return {
                weekday,
                label: WEEKDAY_LABELS[weekday],
                enabled: !!existing,
                group: this.createDayFormGroup(existing?.startTime, existing?.endTime)
            };
        });
    }

    private createDayFormGroup(start?: string, end?: string): FormGroup {
        return this.fb.group(
            {
                startTime: [start ?? '', [Validators.required, timeFormatValidator()]],
                endTime: [end ?? '', [Validators.required, timeFormatValidator()]],
            },
            { validators: endAfterStartGroupValidator() },
        );
    }


    protected toggleDay(row: DayRow): void {
        row.enabled = !row.enabled;
        this.activePicker = null;
        if (!row.enabled) {
            row.group.reset({ startTime: '', endTime: '' });
            row.group.markAsPristine();
            row.group.markAsUntouched();
        }
    }


    protected openPicker(rowIdx: number, field: 'startTime' | 'endTime', e: MouseEvent): void {
        e.stopPropagation();

        if (this.isPickerOpen(rowIdx, field)) {
            this._closeOverlay();
            return;
        }

        this._closeOverlay();
        this.activePicker = { rowIdx, field };

        const seedValue = this.dayRows[rowIdx]?.group.get(field)?.value as string ?? '';
        const pickerLabel = field === 'startTime' ? 'Hora de inicio' : 'Hora de fin';

        this._overlayRef = this.createOverlayConfig();
        this._pickerRef = this.attachPickerToOverlay(this._overlayRef, seedValue, pickerLabel);
    }

    private createOverlayConfig(): OverlayRef {
        const overlayRef = this.overlay.create({
            positionStrategy: this.overlay.position().global()
                .centerHorizontally()
                .centerVertically(),
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop',
        });

        overlayRef.backdropClick().subscribe(() => this._closeOverlay());
        return overlayRef;
    }

    private attachPickerToOverlay(overlayRef: OverlayRef, seedValue: string, label: string): ComponentRef<TimePickerComponent> {
        const pickerInjector = Injector.create({
            providers: [{ provide: TIME_PICKER_SEED, useValue: seedValue }],
            parent: this.injector,
        });

        const portal = new ComponentPortal(TimePickerComponent, null, pickerInjector);
        const pickerRef = overlayRef.attach(portal);

        pickerRef.instance.label = label;
        pickerRef.changeDetectorRef.detectChanges();

        pickerRef.instance.confirmed.subscribe((val) => {
            this.onPickerConfirmed(val);
            this._closeOverlay();
        });
        pickerRef.instance.cancelled.subscribe(() => this._closeOverlay());

        return pickerRef;
    }

    protected onPickerConfirmed(value: string): void {
        if (!this.activePicker) return;
        const ctrl = this.dayRows[this.activePicker.rowIdx].group.get(this.activePicker.field)!;
        ctrl.setValue(value);
        ctrl.markAsTouched();
        this.activePicker = null;
    }

    protected closePicker(): void { this._closeOverlay(); }

    private _closeOverlay(): void {
        this._overlayRef?.dispose();
        this._overlayRef = null;
        this._pickerRef = null;
        this.activePicker = null;
    }

    protected get pickerSeedValue(): string {
        if (!this.activePicker) return '';
        return (this.dayRows[this.activePicker.rowIdx]?.group.get(this.activePicker.field)?.value as string) ?? '';
    }

    protected get pickerLabel(): string {
        return this.activePicker?.field === 'startTime' ? 'Hora de inicio' : 'Hora de fin';
    }

    protected isPickerOpen(rowIdx: number, field: 'startTime' | 'endTime'): boolean {
        return this.activePicker?.rowIdx === rowIdx && this.activePicker.field === field;
    }


    protected getTimeError(row: DayRow, field: 'startTime' | 'endTime'): string {
        if (!row.enabled) return '';
        const ctrl = row.group.get(field);
        if (!ctrl?.touched || !ctrl.errors) return '';
        if (ctrl.errors['required']) return 'Campo requerido';
        if (ctrl.errors['timeFormat']) return ctrl.errors['timeFormat'] as string;
        return '';
    }

    protected getCrossError(row: DayRow): string {
        if (!row.enabled) return '';
        if (
            row.group.errors?.['endAfterStart'] &&
            row.group.get('startTime')?.touched &&
            row.group.get('endTime')?.touched
        ) {
            return row.group.errors['endAfterStart'] as string;
        }
        return '';
    }


    protected onSubmit(): void {
        this.activePicker = null;
        const enabledRows = this.dayRows.filter(r => r.enabled);
        
        enabledRows.forEach(r => r.group.markAllAsTouched());

        if (enabledRows.some(r => r.group.invalid)) {
            this.messageService.showMessage(
                'Corrige los errores en el horario antes de guardar',
                AlertType.WARNING,
            );
            return;
        }

        this.isSubmitting = true;
        this.data.onSubmit(this.buildSubmitRequest(enabledRows));
    }

    private buildSubmitRequest(enabledRows: DayRow[]): UpdateWorkingHoursRequest {
        return {
            workingHours: enabledRows.map(r => ({
                dayOfWeek: r.weekday as any,
                startTime: r.group.get('startTime')!.value as string,
                endTime: r.group.get('endTime')!.value as string,
            })),
        };
    }

    public setSubmitting(value: boolean): void {
        this.isSubmitting = value;
    }

    public close(): void {
        this.dialogRef.close();
    }

    protected onCancel(): void {
        this.dialogRef.close();
    }

    protected display12h(value: string | null | undefined): string {
        return value ? formatTimeTo12Hour(value) : '--:--';
    }

}
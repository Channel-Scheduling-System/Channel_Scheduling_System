import {
    Component,
    OnInit,
    OnDestroy,
    inject,
    computed,
    signal,
    effect,
    ComponentRef,
    Injector,
    ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin, of } from 'rxjs';
import { switchMap, tap, catchError, takeUntil } from 'rxjs/operators';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { AppointmentCreateService } from '../../../services/appointment-create.service';
import { AppointmentsService } from '../../../services/appointments.service';
import { AvailabilityService } from '../../../../calendar/services/availability.service';
import { SessionService } from '../../../../../core/services/session.service';
import { MessageService } from '../../../../../core/services/message.service';
import { DatetimeCalendarComponent } from './calendar/datetime-calendar.component';
import { TimePickerComponent, TIME_PICKER_SEED } from '../../../../../core/components/time-picker/time-picker.component';
import { DatePickerComponent, DATE_PICKER_SEED } from '../../../../../core/components/date-picker/date-picker.component';
import { AppointmentCalendarItem } from '../../../interfaces/appointment-calendar.interface';
import type { WorkerAvailabilityDay } from '../../../../calendar/models/responses/worker-availability-response.model';
import { VerifyOverlapRequest } from '../../../models/requests/create-appointment-request.model';
import { ConfirmationModalComponent, CONFIRMATION_MODAL_DATA } from '../../../components/confirmation-modal/confirmation-modal.component';
import { time12hToIso } from '../../../utils/appointments-time.util';
import { finalize } from 'rxjs/operators';
import { AlertType } from '../../../../../core/utils/enums/AlertType';
@Component({
    selector: 'app-datetime-selection',
    standalone: true,
    imports: [CommonModule, DatetimeCalendarComponent],
    templateUrl: './datetime-selection.component.html',
    styleUrl: './datetime-selection.component.scss',
})
export class DatetimeSelectionComponent implements OnInit, OnDestroy {
    public readonly wizard = inject(AppointmentCreateService);
    private readonly appointmentsService = inject(AppointmentsService);
    private readonly availabilityService = inject(AvailabilityService);
    private readonly sessionService = inject(SessionService);
    private readonly messageService = inject(MessageService);
    private readonly overlay = inject(Overlay);
    private readonly injector = inject(Injector);
    @ViewChild(DatetimeCalendarComponent)
    private calendarRef!: DatetimeCalendarComponent;
    private readonly destroy$ = new Subject<void>();
    private readonly dateChange$ = new Subject<Date>();
    protected trayCollapsed = false;
    protected dateInputFocused = false;
    protected activePicker: 'startTime' | 'endTime' | null = null;
    public isVerifying = false;
    private _overlayRef: OverlayRef | null = null;
    private _pickerRef: ComponentRef<any> | null = null;
    private readonly _pendingDate = signal<Date | null>(null);
    private readonly _pendingTime = signal<number | null>(null); 
    protected clientAppointments: AppointmentCalendarItem[] = [];
    protected availabilityDay: WorkerAvailabilityDay | null = null;
    private _loadedDateStr: string | null = null;
    protected readonly selectedDateTime = this.wizard.selectedDateTime;
    protected readonly canGoNext = this.wizard.canGoNext;
    protected readonly visibleStep = this.wizard.visibleStep;
    protected readonly dateInputValue = computed(() => {
        const dt = this.wizard.selectedDateTime() ?? this._pendingDate();
        if (!dt) return '';
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const d = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    });
    private readonly startTime24 = computed(() => {
        const dt = this.wizard.selectedDateTime();
        if (dt) {
            return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
        }
        const pending = this._pendingTime();
        if (pending !== null) {
            const h = Math.floor(pending / 60);
            const m = pending % 60;
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        }
        return '';
    });
    private readonly endTime24 = computed(() => {
        const dt = this.wizard.selectedDateTime();
        const startMin = dt
            ? dt.getHours() * 60 + dt.getMinutes()
            : this._pendingTime();
        if (startMin === null) return '';
        const totalMin = (startMin ?? 0) + this.wizard.totalDuration();
        const h = Math.floor(totalMin / 60) % 24;
        const m = totalMin % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    });
    protected readonly startTimeDisplay = computed(() => this.to12h(this.startTime24()));
    protected readonly endTimeDisplay = computed(() => this.to12h(this.endTime24()));
    protected readonly hasTimeSelection = computed(() =>
        this.wizard.selectedDateTime() !== null || this._pendingTime() !== null
    );
    constructor() {
        effect(() => {
            const dt = this.wizard.selectedDateTime();
            if (dt) {
                this._syncPendingFromWizard(dt);
            }
        });
    }
    public ngOnInit(): void {
        const existing = this.wizard.selectedDateTime();
        if (existing) {
            this._syncPendingFromWizard(existing);
        }
        this.dateChange$
            .pipe(
                switchMap(date => this.loadDayData(date)),
                takeUntil(this.destroy$),
            )
            .subscribe();
        this.dateChange$.next(new Date());
    }
    public ngOnDestroy(): void {
        this._closeOverlay();
        this.destroy$.next();
        this.destroy$.complete();
    }
    private loadDayData(date: Date) {
        const dateParam = this.formatDateParam(date);
        const role = this.wizard.userRole();
        const clientId = role === 'WORKER'
            ? (this.wizard.selectedWorkerForAppointment()?.id ?? undefined)
            : undefined;
        const appointments$ = this.appointmentsService
            .getActiveAppointments({
                view: 'DAY',
                date: dateParam,
                ...(clientId !== undefined ? { clientId } : {}),
            })
            .pipe(catchError(() => of(null)));
        const rawId = this.resolveWorkerId();
        const workerId = (rawId != null && Number.isFinite(rawId) && rawId > 0) ? rawId : null;
        const availability$ = workerId
            ? this.availabilityService
                .getWorkerAvailability(workerId, { view: 'DAY', date: dateParam })
                .pipe(catchError(() => of(null)))
            : of(null);
        return forkJoin({ appointments: appointments$, availability: availability$ }).pipe(
            tap(({ appointments, availability }) => {
                this.clientAppointments = appointments
                    ? (appointments.data as AppointmentCalendarItem[])
                    : [];
                const days: WorkerAvailabilityDay[] | undefined = availability?.data;
                if (days?.length) {
                    this.availabilityDay = days.find(d => d.date === dateParam) ?? days[0] ?? null;
                } else {
                    this.availabilityDay = null;
                }
                this._loadedDateStr = dateParam;
            }),
        );
    }
    private resolveWorkerId(): number | null {
        if (this.wizard.userRole() === 'WORKER') {
            const id = this.sessionService.getUserId();
            return (id != null && !isNaN(Number(id))) ? Number(id) : null;
        }
        return this.wizard.lockedWorkerId();
    }
    private formatDateParam(date: Date): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    protected toggleTray(): void { this.trayCollapsed = !this.trayCollapsed; }
    protected onDateChange(date: Date): void {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        this._pendingDate.set(dayStart);
        this.dateChange$.next(date);
    }
    protected onDateInputChange(event: Event): void {
        const raw = (event.target as HTMLInputElement).value; 
        if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return;
        const [y, m, d] = raw.split('-').map(Number);
        if (y < 2000 || y > 2100) {
            this.messageService.showMessage('Por favor ingresa un año válido', 'warning');
            return;
        }
        const dateOnly = new Date(y, m - 1, d, 0, 0, 0, 0);
        this._pendingDate.set(dateOnly);
        const pendingMin = this._pendingTime();
        if (pendingMin !== null) {
            this._commitBothParts(dateOnly, pendingMin, /* emitChange */ true);
        } else {
            this._navigateDayOnly(dateOnly);
        }
    }
    protected openDatePicker(e: MouseEvent): void {
        e.stopPropagation();
        if (this.activePicker === ('date' as any)) {
            this._closeOverlay();
            return;
        }
        this._closeOverlay();
        (this.activePicker as any) = 'date';
        const seed = this.dateInputValue();
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
            const [y, m, d] = val.split('-').map(Number);
            const dateOnly = new Date(y, m - 1, d, 0, 0, 0, 0);
            this._pendingDate.set(dateOnly);
            const pendingMin = this._pendingTime();
            if (pendingMin !== null) {
                this._commitBothParts(dateOnly, pendingMin, /* emitChange */ true);
            } else {
                this._navigateDayOnly(dateOnly);
            }
            this._closeOverlay();
        });
        ref.instance.cancelled.subscribe(() => this._closeOverlay());
        this._pickerRef = ref;
    }
    protected openTimePicker(field: 'startTime' | 'endTime', e: MouseEvent): void {
        e.stopPropagation();
        if (this.activePicker === field) {
            this._closeOverlay();
            return;
        }
        this._closeOverlay();
        this.activePicker = field;
        const seed = field === 'startTime' ? this.startTime24() : this.endTime24();
        const label = field === 'startTime' ? 'Hora de inicio' : 'Hora de finalización';
        this._overlayRef = this._createOverlay();
        const inj = Injector.create({
            providers: [{ provide: TIME_PICKER_SEED, useValue: seed }],
            parent: this.injector,
        });
        const portal = new ComponentPortal(TimePickerComponent, null, inj);
        const ref = this._overlayRef.attach(portal);
        ref.instance.label = label;
        ref.changeDetectorRef.detectChanges();
        ref.instance.confirmed.subscribe((val: string) => {
            this._onTimeConfirmed(field, val);
            this._closeOverlay();
        });
        ref.instance.cancelled.subscribe(() => this._closeOverlay());
        this._pickerRef = ref;
    }
    private _onTimeConfirmed(field: 'startTime' | 'endTime', val: string): void {
        const MINUTES_IN_DAY = 24 * 60; 
        const durationMin = this.wizard.totalDuration();
        const [hh, mm] = val.split(':').map(Number);
        let startTotalMin: number;
        let clamped = false;
        if (field === 'startTime') {
            startTotalMin = hh * 60 + mm;
            if (startTotalMin + durationMin > MINUTES_IN_DAY) {
                startTotalMin = MINUTES_IN_DAY - durationMin;
                clamped = true;
            }
        } else {
            let endTotal = hh * 60 + mm;
            startTotalMin = endTotal - durationMin;
            if (startTotalMin < 0) {
                startTotalMin = 0;
                endTotal = durationMin;
                clamped = true;
            } else if (endTotal > MINUTES_IN_DAY) {
                endTotal = MINUTES_IN_DAY;
                startTotalMin = MINUTES_IN_DAY - durationMin;
                clamped = true;
            }
        }
        if (clamped) {
            this.messageService.showMessage(
                'Este rango de la cita no está permitido',
                'warning',
            );
        }
        this._pendingTime.set(startTotalMin);
        const pendingDate = this._pendingDate()
            ?? (this.wizard.selectedDateTime()
                ? (() => {
                    const d = new Date(this.wizard.selectedDateTime()!);
                    d.setHours(0, 0, 0, 0);
                    return d;
                })()
                : null);
        if (pendingDate !== null) {
            this._commitBothParts(pendingDate, startTotalMin, /* emitChange */ false);
        }
    }
    private _navigateDayOnly(dateOnly: Date): void {
        this.dateChange$.next(dateOnly);
        this.calendarRef?.navigateDayOnly(dateOnly);
    }
    private _commitBothParts(dateOnly: Date, timeMin: number, emitChange: boolean): void {
        const h = Math.floor(timeMin / 60);
        const m = timeMin % 60;
        const updated = new Date(dateOnly);
        updated.setHours(h, m, 0, 0);
        if (updated.getTime() < Date.now()) {
            this.messageService.showMessage(
                'No se puede agendar una cita en una fecha y hora pasadas',
                'warning',
            );
            return;
        }
        this.wizard.setSelectedDateTime(updated);
        this.calendarRef?.scrollToDate(updated, emitChange);
    }
    private _syncPendingFromWizard(dt: Date): void {
        const dateOnly = new Date(dt);
        dateOnly.setHours(0, 0, 0, 0);
        this._pendingDate.set(dateOnly);
        this._pendingTime.set(dt.getHours() * 60 + dt.getMinutes());
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
        this.activePicker = null;
    }
    private to12h(raw: string): string {
        if (!raw) return '—';
        const [h, m] = raw.split(':').map(Number);
        const hr = h % 12 || 12;
        const mm = String(m).padStart(2, '0');
        const ampm = h < 12 ? 'am' : 'pm';
        return `${hr}:${mm} ${ampm}`;
    }
    public onNext(): void {
        if (!this.canGoNext() || this.isVerifying) return;
        if (this.hasRangeConflict()) {
            this.messageService.showMessage(
                'El rango seleccionado para la cita no es válido, selecciona otro.',
                AlertType.WARNING,
            );
            return;
        }
        const request = this._buildVerifyOverlapRequest();
        if (!request) return;
        this.isVerifying = true;
        this.appointmentsService.verifyOverlap(request).pipe(
            finalize(() => { this.isVerifying = false; }),
            takeUntil(this.destroy$),
        ).subscribe({
            next: (response) => {
                const { allowed, needsConfirmation } = response.data;
                if (!allowed) {
                    this.messageService.showMessage(
                        'No es posible crear la cita en el horario seleccionado',
                        'error',
                    );
                    return;
                }
                if (needsConfirmation) {
                    this._openConfirmationModal();
                    return;
                }
                this.wizard.nextStep();
            },
            error: () => {
                this.messageService.showMessage(
                    'Error al verificar disponibilidad, intenta de nuevo',
                    'error',
                );
            },
        });
    }
    private _buildVerifyOverlapRequest(): VerifyOverlapRequest | null {
        const selectedDt = this.wizard.selectedDateTime();
        if (!selectedDt) return null;
        const isWorker = this.wizard.userRole() === 'WORKER';
        const rawId = isWorker
            ? this.sessionService.getUserId()
            : this.wizard.lockedWorkerId();
        const workerId = rawId !== null && !isNaN(Number(rawId)) ? Number(rawId) : null;
        if (!workerId) return null;
        const h = selectedDt.getHours();
        const m = selectedDt.getMinutes();
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        const ampm = h < 12 ? 'am' : 'pm';
        const h12 = h % 12 || 12;
        const startAt = time12hToIso(selectedDt, `${h12}:${mm} ${ampm}`);
        if (!startAt) return null;
        const services = this.wizard.selectedServices().map(s => ({
            serviceId: s.id,
            customDuration: this.wizard.getEffectiveDuration(s.id),
        }));
        return { workerId, startAt, services };
    }
    private _openConfirmationModal(): void {
        this._closeOverlay();
        this._overlayRef = this._createOverlay();
        const inj = Injector.create({
            providers: [{
                provide: CONFIRMATION_MODAL_DATA,
                useValue: {
                    title: 'Confirmar sobreposicionamiento de citas',
                    message: 'Esta cita se solapará con otra ya existente en el mismo periodo. ¿Deseas continuar?',
                },
            }],
            parent: this.injector,
        });
        const portal = new ComponentPortal(ConfirmationModalComponent, null, inj);
        const ref = this._overlayRef.attach(portal);
        ref.changeDetectorRef.detectChanges();
        ref.instance.confirmed.subscribe(() => {
            this._closeOverlay();
            this.wizard.nextStep();
        });
        ref.instance.cancelled.subscribe(() => this._closeOverlay());
        this._pickerRef = ref;
    }
    private hasRangeConflict(): boolean {
        const selectedDt = this.wizard.selectedDateTime();
        if (!selectedDt) return false;
        const durationMin = this.wizard.totalDuration();
        const startTotalMin = selectedDt.getHours() * 60 + selectedDt.getMinutes();
        const endTotalMin = startTotalMin + durationMin;
        const dateStr = this.formatDateParam(selectedDt);
        const dataMatchesSelection = this._loadedDateStr === dateStr;
        if (!dataMatchesSelection) {
            return false;
        }
        const dayAppts = this.clientAppointments.filter(
            a => a.startAt.slice(0, 10) === dateStr,
        );
        const hasClientConflict = dayAppts.some(appt => {
            const apptStart = this.apptToMin(appt.startAt);
            const apptEnd = this.apptToMin(appt.endAt);
            return startTotalMin < apptEnd && endTotalMin > apptStart;
        });
        if (hasClientConflict) return true;
        if (this.availabilityDay) {
            const isWorker = this.wizard.userRole() === 'WORKER';
            if (!isWorker) {
                const hasOccupied = this.availabilityDay.occupied.some(slot => {
                    const s = this.timeToMin(slot.start);
                    const e = this.timeToMin(slot.end);
                    return startTotalMin < e && endTotalMin > s;
                });
                if (hasOccupied) return true;
            }
            const coverageSlots = isWorker
                ? [...this.availabilityDay.available, ...this.availabilityDay.occupied]
                : this.availabilityDay.available;
            if (coverageSlots.length === 0) return true;
            const sorted = coverageSlots
                .map(s => ({ s: this.timeToMin(s.start), e: this.timeToMin(s.end) }))
                .sort((a, b) => a.s - b.s);
            let cursor = startTotalMin;
            for (const { s, e } of sorted) {
                if (s > cursor) break;
                if (e > cursor) cursor = e;
                if (cursor >= endTotalMin) return false;
            }
            if (cursor < endTotalMin) return true;
        }
        return false;
    }
    private apptToMin(iso: string): number {
        const h = parseInt(iso.slice(11, 13), 10);
        const m = parseInt(iso.slice(14, 16), 10);
        return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
    }
    private timeToMin(t: string): number {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    }
}
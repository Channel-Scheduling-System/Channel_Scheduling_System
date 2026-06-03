import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, EMPTY } from 'rxjs';
import { switchMap, takeUntil, tap, catchError } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentsService } from '../../services/appointments.service';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { AppointmentHistoryItem } from '../../models/responses/appointments-list-response.model';
import { AppointmentStatus } from '../../../../shared/models/entities/appointment.schema';
import { Meta } from '../../../../shared/models/entities/entity-base.schema';
import { PaginationComponent } from '../../../../core/components/pagination/pagination.component';
import { FormHeaderComponent } from '../../../../core/components/form-header/form-header.component';
import { DatePickerComponent } from '../../../../core/components/date-picker/date-picker.component';
import { SessionService } from '../../../../core/services/session.service';

type AppointmentStatusValue = AppointmentStatus;

interface StatusOption {
    value: AppointmentStatusValue;
    label: string;
    icon: string;
}

const ALL_STATUSES: AppointmentStatusValue[] = [
    'PENDING',
    'REJECTED',
    'SCHEDULED',
    'IN_PROGRESS',
    'CANCELLED',
    'COMPLETED',
    'NO_SHOW',
];

@Component({
    selector: 'app-appointments-history',
    standalone: true,
    imports: [CommonModule, PaginationComponent, FormHeaderComponent, DatePickerComponent],
    templateUrl: './appointments-history.component.html',
    styleUrl: './appointments-history.component.scss',
})
export class AppointmentsHistoryPageComponent implements OnInit, OnDestroy {

    // ── Data ────────────────────────────────────────────────────────────────────
    protected appointments: AppointmentHistoryItem[] = [];
    protected meta: Meta = { total: 0, limit: 10, page: 1, totalPages: 1 };
    protected isLoading = false;

    // ── Filters ─────────────────────────────────────────────────────────────────
    protected selectedStatuses: Set<AppointmentStatusValue> = new Set(ALL_STATUSES);
    protected fromDate: string | undefined = undefined;
    protected toDate: string | undefined = undefined;

    // ── UI state ────────────────────────────────────────────────────────────────
    protected statusDropdownOpen = false;
    protected fromPickerOpen = false;
    protected toPickerOpen = false;

    // ── Pagination ───────────────────────────────────────────────────────────────
    private currentPage = 1;
    private pageChange$ = new Subject<void>();
    private destroy$ = new Subject<void>();

    // ── Route params ─────────────────────────────────────────────────────────────
    private clientIdFromUrl: number | null = null;
    private workerIdParam: number | undefined = undefined;
    private clientIdParam: number | undefined = undefined;

    // ── Services ─────────────────────────────────────────────────────────────────
    private readonly appointmentsService = inject(AppointmentsService);
    private readonly messageService = inject(MessageService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly sessionService = inject(SessionService);

    // ── Status catalogue ─────────────────────────────────────────────────────────
    readonly statusOptions: StatusOption[] = [
        { value: 'PENDING', label: 'Pendiente', icon: 'pending' },
        { value: 'SCHEDULED', label: 'Agendada', icon: 'event_available' },
        { value: 'IN_PROGRESS', label: 'En progreso', icon: 'timer' },
        { value: 'COMPLETED', label: 'Completada', icon: 'check_circle' },
        { value: 'CANCELLED', label: 'Cancelada', icon: 'cancel' },
        { value: 'REJECTED', label: 'Rechazada', icon: 'do_not_disturb_on' },
        { value: 'NO_SHOW', label: 'No asistió', icon: 'person_off' },
    ];

    // ── Lifecycle ────────────────────────────────────────────────────────────────
    public ngOnInit(): void {
        const urlId = Number(this.route.snapshot.paramMap.get('id'));
        this.clientIdFromUrl = isNaN(urlId) ? null : urlId;

        const role = this.sessionService.getRole();
        const sessionId = this.sessionService.getUserId();

        if (role === 'CLIENT') {
            if (sessionId !== this.clientIdFromUrl) {
                // CLIENT can't see another user's history
                this.router.navigate(['../'], { relativeTo: this.route });
                return;
            }
            // CLIENT viewing own history – no id params needed
            this.workerIdParam = undefined;
            this.clientIdParam = undefined;
        } else if (role === 'WORKER') {
            if (sessionId === this.clientIdFromUrl) {
                // WORKER viewing their own history – no id params
                this.workerIdParam = undefined;
                this.clientIdParam = undefined;
            } else {
                // WORKER viewing a client's history
                this.workerIdParam = undefined;
                this.clientIdParam = this.clientIdFromUrl ?? undefined;
            }
        }
        // ADMIN role: no restrictions, no id filter needed

        this.pageChange$
            .pipe(
                tap(() => { this.isLoading = true; }),
                switchMap(() => this.loadAppointments()),
                takeUntil(this.destroy$),
            )
            .subscribe();

        this.pageChange$.next();
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Close dropdowns on outside click ─────────────────────────────────────────
    @HostListener('document:click')
    onDocumentClick(): void {
        this.statusDropdownOpen = false;
        this.fromPickerOpen = false;
        this.toPickerOpen = false;
    }

    // ── Navigation ───────────────────────────────────────────────────────────────
    protected goBack(): void {
        this.router.navigate(['../../'], { relativeTo: this.route });
    }

    protected get allStatusesSelected(): boolean {
        return this.selectedStatuses.size === ALL_STATUSES.length;
    }

    protected selectAllStatuses(event: Event): void {
        event.stopPropagation();
        this.selectedStatuses = new Set(ALL_STATUSES);
        this.currentPage = 1;
        this.pageChange$.next();
    }

    protected onPageChange(page: number): void {
        this.currentPage = page;
        this.pageChange$.next();
    }

    // ── Status filter ─────────────────────────────────────────────────────────────
    protected toggleStatusDropdown(event: Event): void {
        event.stopPropagation();
        this.statusDropdownOpen = !this.statusDropdownOpen;
        this.fromPickerOpen = false;
        this.toPickerOpen = false;
    }

    protected toggleStatus(status: AppointmentStatusValue, event: Event): void {
        event.stopPropagation();
        if (this.selectedStatuses.has(status)) {
            if (this.selectedStatuses.size === 1) return; // keep at least one
            this.selectedStatuses.delete(status);
        } else {
            this.selectedStatuses.add(status);
        }
        this.selectedStatuses = new Set(this.selectedStatuses); // trigger CD
        this.currentPage = 1;
        this.pageChange$.next();
    }

    protected isStatusSelected(status: AppointmentStatusValue): boolean {
        return this.selectedStatuses.has(status);
    }

    protected get statusDropdownLabel(): string {
        if (this.selectedStatuses.size === ALL_STATUSES.length) return 'Todos los estados';
        if (this.selectedStatuses.size === 1) {
            const only = [...this.selectedStatuses][0];
            return this.statusOptions.find(o => o.value === only)?.label ?? only;
        }
        return `${this.selectedStatuses.size} estados`;
    }

    protected get statusDropdownIcon(): string {
        if (this.selectedStatuses.size === ALL_STATUSES.length) return 'filter_list';
        if (this.selectedStatuses.size === 1) {
            const only = [...this.selectedStatuses][0];
            return this.statusOptions.find(o => o.value === only)?.icon ?? 'filter_list';
        }
        return 'filter_list';
    }

    // ── Date filters ──────────────────────────────────────────────────────────────
    protected toggleFromPicker(event: Event): void {
        event.stopPropagation();
        this.fromPickerOpen = !this.fromPickerOpen;
        this.statusDropdownOpen = false;
        this.toPickerOpen = false;
    }

    protected toggleToPicker(event: Event): void {
        event.stopPropagation();
        this.toPickerOpen = !this.toPickerOpen;
        this.statusDropdownOpen = false;
        this.fromPickerOpen = false;
    }

    protected onFromDateConfirmed(date: string): void {
        this.fromDate = date;
        this.fromPickerOpen = false;
        this.currentPage = 1;
        this.pageChange$.next();
    }

    protected onToDateConfirmed(date: string): void {
        this.toDate = date;
        this.toPickerOpen = false;
        this.currentPage = 1;
        this.pageChange$.next();
    }

    protected onFromDateCancelled(): void {
        this.fromPickerOpen = false;
    }

    protected onToDateCancelled(): void {
        this.toPickerOpen = false;
    }

    protected clearFromDate(event: Event): void {
        event.stopPropagation();
        this.fromDate = undefined;
        this.fromPickerOpen = false;
        this.currentPage = 1;
        this.pageChange$.next();
    }

    protected clearToDate(event: Event): void {
        event.stopPropagation();
        this.toDate = undefined;
        this.toPickerOpen = false;
        this.currentPage = 1;
        this.pageChange$.next();
    }

    protected get fromDateLabel(): string {
        return this.fromDate ? this.formatShortDate(this.fromDate) : 'Desde';
    }

    protected get toDateLabel(): string {
        return this.toDate ? this.formatShortDate(this.toDate) : 'Hasta';
    }

    // ── Formatting helpers ────────────────────────────────────────────────────────
    protected formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-CO', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }

    protected formatTime(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    }

    private formatShortDate(dateStr: string): string {
        const [y, m, d] = dateStr.split('-');
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
    }

    protected getStatusLabel(status: AppointmentStatusValue): string {
        return this.statusOptions.find(o => o.value === status)?.label ?? status;
    }

    protected getStatusIcon(status: AppointmentStatusValue): string {
        return this.statusOptions.find(o => o.value === status)?.icon ?? 'info';
    }

    // ── Data loading ──────────────────────────────────────────────────────────────
    private loadAppointments() {
        const statuses = [...this.selectedStatuses] as any;

        return this.appointmentsService
            .getAppointmentsBy({
                ...(this.workerIdParam !== undefined && { workerId: this.workerIdParam as any }),
                ...(this.clientIdParam !== undefined && { clientId: this.clientIdParam as any }),
                status: statuses,
                from: this.fromDate as any,
                to: this.toDate as any,
                page: this.currentPage as any,
            })
            .pipe(
                tap(response => {
                    this.appointments = response.data;
                    this.meta = response.meta;
                    this.isLoading = false;
                }),
                catchError(_err => {
                    this.isLoading = false;
                    this.messageService.showMessage(
                        'No se pudo cargar el historial de citas. Intenta nuevamente.',
                        AlertType.ERROR,
                    );
                    return EMPTY;
                }),
            );
    }
}
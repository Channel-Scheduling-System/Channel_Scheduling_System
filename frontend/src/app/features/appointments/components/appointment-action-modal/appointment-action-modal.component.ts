import {
  AfterViewChecked,
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentActionModalService } from '../../utils/appointments-actions-modal.service';
import { AppointmentsService } from '../../services/appointments.service';
import { MessageService } from '../../../../core/services/message.service';
import { SessionService } from '../../../../core/services/session.service';

type ValidState = 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW';

interface StateOption {
  key: ValidState;
  label: string;
}

@Component({
  selector: 'app-appointment-action-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-action-modal.component.html',
  styleUrls: ['./appointment-action-modal.component.scss'],
})
export class AppointmentActionModalComponent implements AfterViewChecked {

  private readonly svc             = inject(AppointmentActionModalService);
  private readonly appointmentsSvc = inject(AppointmentsService);
  private readonly messageSvc      = inject(MessageService);
  private readonly sessionSvc      = inject(SessionService);

  protected readonly visible     = computed(() => this.svc.state().visible);
  protected readonly headerIcon  = computed(() => this.svc.state().headerIcon);
  protected readonly title       = computed(() => this.svc.state().title);
  protected readonly subtitle    = computed(() => this.svc.state().subtitle);
  protected readonly statusLabel = computed(() => this.svc.state().statusLabel);
  protected readonly statusKey   = computed(() => this.svc.state().statusKey);
  protected readonly actions     = computed(() => this.svc.state().actions);
  protected readonly notes       = computed(() => this.svc.state().notes);

  protected readonly isWorker = computed(() => this.sessionSvc.getRole() === 'WORKER');

  protected dropdownOpen = signal(false);

  protected selectedStateKey = signal<ValidState | null>(null);

  protected readonly stateOptions: StateOption[] = [
    { key: 'IN_PROGRESS', label: 'En progreso' },
    { key: 'COMPLETED',   label: 'Completada'  },
    { key: 'NO_SHOW',     label: 'No asistió'  },
  ];

  @ViewChild('modalPanel') private modalPanel!: ElementRef<HTMLElement>;

  private _positioned = false;

  private readonly EDGE_MARGIN = 12;
  private readonly CLICK_GAP   = 10;

  ngAfterViewChecked(): void {
    if (!this.visible()) {
      this._positioned = false;
      this.dropdownOpen.set(false);
      return;
    }
    if (!this.modalPanel?.nativeElement || this._positioned) { return; }

    const currentStatus = this.statusKey();
    const isValid = this.stateOptions.some(o => o.key === currentStatus);
    this.selectedStateKey.set(isValid ? (currentStatus as ValidState) : null);
    this.dropdownOpen.set(false);

    this.applyPosition();
    this._positioned = true;
  }

  protected close(): void {
    this.dropdownOpen.set(false);
    this.svc.hide();
  }

  protected run(handler: () => void): void {
    handler();
    this.svc.hide();
  }

  protected toggleDropdown(): void {
    this.dropdownOpen.update(v => !v);
  }

  protected selectState(option: StateOption): void {
    if (option.key === this.selectedStateKey()) {
      this.dropdownOpen.set(false);
      return;
    }

    const appointmentId = this.svc.state().appointmentId;
    if (!appointmentId) {
      console.warn('No appointmentId found in modal state');
      this.dropdownOpen.set(false);
      return;
    }

    this.dropdownOpen.set(false);

    this.appointmentsSvc
      .setAppointmentState(appointmentId, { status: option.key })
      .subscribe({
        next: (response) => {
          this.selectedStateKey.set(option.key);
          this.messageSvc.showMessage(response.message, 'success');
          this.svc.notifyStateUpdated();
        },
        error: () => {
          this.messageSvc.showMessage(
            'No se pudo actualizar el estado de la cita. Inténtalo de nuevo.',
            'error',
          );
        },
      });
  }

  protected getSelectedLabel(): string {
    const key = this.selectedStateKey();
    if (!key) { return this.statusLabel() ?? ''; }
    return this.stateOptions.find(o => o.key === key)?.label ?? this.statusLabel() ?? '';
  }

  protected getSelectedKey(): string {
    return this.selectedStateKey() ?? this.statusKey() ?? '';
  }

  private applyPosition(): void {
    const el            = this.modalPanel.nativeElement;
    const { left, top } = this.calcPosition(el);
    el.style.left       = `${left}px`;
    el.style.top        = `${top}px`;
  }

  private calcPosition(el: HTMLElement): { left: number; top: number } {
    const { anchorX, anchorY } = this.resolveAnchor();
    return {
      left: this.clampHorizontal(anchorX, el.offsetWidth),
      top:  this.clampVertical(anchorY, el.offsetHeight),
    };
  }

  private resolveAnchor(): { anchorX: number; anchorY: number } {
    const st = this.svc.state();
    return {
      anchorX: st.anchorX ?? window.innerWidth  / 2,
      anchorY: st.anchorY ?? window.innerHeight / 2,
    };
  }

  private clampHorizontal(anchorX: number, modalWidth: number): number {
    const M    = this.EDGE_MARGIN;
    const left = anchorX - modalWidth * 0.25;
    if (left + modalWidth > window.innerWidth - M) { return Math.round(window.innerWidth - M - modalWidth); }
    if (left < M)                                  { return Math.round(M); }
    return Math.round(left);
  }

  private clampVertical(anchorY: number, modalHeight: number): number {
    const M   = this.EDGE_MARGIN;
    const G   = this.CLICK_GAP;
    const top = anchorY + G;
    if (top + modalHeight > window.innerHeight - M) { return Math.round(anchorY - modalHeight - G); }
    if (top < M)                                    { return Math.round(M); }
    return Math.round(top);
  }
}
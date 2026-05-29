import {
  AfterViewChecked,
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentActionModalService } from '../../utils/appointments-actions-modal.service';

@Component({
  selector: 'app-appointment-action-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-action-modal.component.html',
  styleUrls: ['./appointment-action-modal.component.scss'],
})
export class AppointmentActionModalComponent implements AfterViewChecked {

  private readonly svc = inject(AppointmentActionModalService);

  protected readonly visible     = computed(() => this.svc.state().visible);
  protected readonly headerIcon  = computed(() => this.svc.state().headerIcon);
  protected readonly title       = computed(() => this.svc.state().title);
  protected readonly subtitle    = computed(() => this.svc.state().subtitle);
  protected readonly statusLabel = computed(() => this.svc.state().statusLabel);
  protected readonly statusKey   = computed(() => this.svc.state().statusKey);
  protected readonly actions     = computed(() => this.svc.state().actions);
  protected readonly notes       = computed(() => this.svc.state().notes);

  @ViewChild('modalPanel') private modalPanel!: ElementRef<HTMLElement>;

  private _positioned = false;

  private readonly EDGE_MARGIN = 12;
  private readonly CLICK_GAP   = 10;

  ngAfterViewChecked(): void {
    if (!this.visible()) {
      this._positioned = false;
      return;
    }
    if (!this.modalPanel?.nativeElement || this._positioned) { return; }

    this.applyPosition();
    this._positioned = true;
  }

  protected close(): void {
    this.svc.hide();
  }

  protected run(handler: () => void): void {
    handler();
    this.svc.hide();
  }

  private applyPosition(): void {
    const el             = this.modalPanel.nativeElement;
    const { left, top }  = this.calcPosition(el);
    el.style.left        = `${left}px`;
    el.style.top         = `${top}px`;
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
import {
  Component,
  EventEmitter,
  inject,
  InjectionToken,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
export interface ConfirmationModalData {
  title:   string;
  message: string;
}
export const CONFIRMATION_MODAL_DATA =
  new InjectionToken<ConfirmationModalData>('CONFIRMATION_MODAL_DATA');
@Component({
  selector:    'app-confirmation-modal',
  standalone:  true,
  imports:     [CommonModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl:    './confirmation-modal.component.scss',
})
export class ConfirmationModalComponent {
  protected readonly data = inject(CONFIRMATION_MODAL_DATA);
  @Output() public readonly confirmed = new EventEmitter<void>();
  @Output() public readonly cancelled = new EventEmitter<void>();
  protected onConfirm(): void {
    this.confirmed.emit();
  }
  protected onCancel(): void {
    this.cancelled.emit();
  }
}
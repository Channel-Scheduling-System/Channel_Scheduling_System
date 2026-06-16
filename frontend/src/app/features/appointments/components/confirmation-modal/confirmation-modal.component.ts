import {
  Component,
  EventEmitter,
  inject,
  InjectionToken,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, ValidatorFn } from '@angular/forms';

export interface ConfirmationModalTextField {
  label:       string;
  icon:        string;
  placeholder?: string;
  validator?:  ValidatorFn;
}

export interface ConfirmationModalData {
  title:     string;
  message:   string;
  textField?: ConfirmationModalTextField;
}

export const CONFIRMATION_MODAL_DATA =
  new InjectionToken<ConfirmationModalData>('CONFIRMATION_MODAL_DATA');

@Component({
  selector:    'app-confirmation-modal',
  standalone:  true,
  imports:     [CommonModule, ReactiveFormsModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl:    './confirmation-modal.component.scss',
})
export class ConfirmationModalComponent implements OnInit {
  protected readonly data = inject(CONFIRMATION_MODAL_DATA);
  private readonly fb    = inject(FormBuilder);

  protected textControl!: FormControl;

  @Output() public readonly confirmed = new EventEmitter<string | undefined>();
  @Output() public readonly cancelled = new EventEmitter<void>();

  public ngOnInit(): void {
    const validators = this.data.textField?.validator ? [this.data.textField.validator] : [];
    this.textControl = this.fb.control('', validators);
  }

  protected get fieldError(): string {
    if (!this.textControl?.touched || !this.textControl?.errors) { return ''; }
    return this.textControl.errors['cancelReason'] ?? '';
  }

  protected get fieldLength(): number {
    return (this.textControl?.value ?? '').length;
  }

  protected onConfirm(): void {
    if (this.data.textField) {
      this.textControl.markAsTouched();
      if (this.textControl.invalid) { return; }
      this.confirmed.emit(this.textControl.value || undefined);
    } else {
      this.confirmed.emit(undefined);
    }
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }
}
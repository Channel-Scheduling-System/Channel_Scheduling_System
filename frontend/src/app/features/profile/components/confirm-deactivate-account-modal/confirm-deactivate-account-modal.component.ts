import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProfileService } from '../../../profile/services/profile.service';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { deactivatePasswordValidator } from '../../../profile/validators/deactivate-profile.validators';
import { DeactivateProfileResponse } from '../../models/responses/deativate-profile-response.model';
import { ErrorResponse } from '../../../../shared/models/api/error-response.schema';
import { SessionService } from '../../../../core/services/session.service';

@Component({
  selector: 'app-confirm-deactivate-account-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './confirm-deactivate-account-modal.component.html',
  styleUrl:  './confirm-deactivate-account-modal.component.scss',
})
export class ConfirmDeactivateAccountModalComponent {

  protected passwordControl = new FormControl('', [
    Validators.required,
    deactivatePasswordValidator(),
  ]);

  protected showPassword = false;
  protected isLoading    = false;

  
  protected get passwordError(): string {
    const c = this.passwordControl;
    if (!c.touched || !c.errors) return '';
    if (c.errors['required'])    return 'La contraseña es obligatoria';
    if (c.errors['password'])    return c.errors['password'];
    return 'Contraseña inválida';
  }

  constructor(
    public  dialogRef:      MatDialogRef<ConfirmDeactivateAccountModalComponent>,
    private profileService: ProfileService,
    private messageService: MessageService,
    private sessionService: SessionService,
    @Inject(MAT_DIALOG_DATA) public data: {}
  ) {}

  protected get reactivationContact(): string {
    return this.sessionService.getRole() === 'ADMIN' ? 'el Equipo de Soporte' : 'un Administrador';
  }

  protected togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  protected confirm(): void {
    if (this.isLoading) return;
    this.passwordControl.markAsTouched();
    if (this.passwordControl.invalid) {
      this.messageService.showMessage('Porfavor completa el campo correctamente', AlertType.WARNING);
      return;
    }

    this.isLoading = true;
    this.profileService.deactivateAccount({ password: this.passwordControl.value! }).subscribe({
      next:  (response)      => this.handleDeactivateSuccess(response),
      error: (error) => this.handleDeactivateError(error),
    });
  }

  private handleDeactivateSuccess(response: DeactivateProfileResponse): void {
    this.dialogRef.close(true);
    this.messageService.showMessage(response.message, AlertType.SUCCESS);
  }

  private handleDeactivateError(error: ErrorResponse): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }
}
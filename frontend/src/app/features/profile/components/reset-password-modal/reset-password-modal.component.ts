import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogRef } from '@angular/material/dialog';
import { ProfileService } from '../../../profile/services/profile.service';
import { SessionService } from '../../../../core/services/session.service';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { resetPasswordFieldValidator } from '../../../profile/validators/reset-password.validators';
import { ResetUserPasswordResponse } from '../../models/responses/reset-password-response.model';
import { ErrorResponse } from '../../../../shared/models/api/error-response.schema';
import { passwordMatchValidator } from '../../../users/validators/register-user.validators';

@Component({
  selector: 'app-reset-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './reset-password-modal.component.html',
  styleUrl: './reset-password-modal.component.scss',
})
export class ResetPasswordModalComponent implements OnInit {

  protected form!: FormGroup;

  protected showCurrentPassword = false;
  protected showNewPassword = false;
  protected showConfirmPassword = false;
  protected showChecklist = false;
  protected isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<ResetPasswordModalComponent>,
    private profileService: ProfileService,
    private sessionService: SessionService,
    private messageService: MessageService,
  ) { }

  public ngOnInit(): void {
    this.form = new FormGroup(
      {
        password: new FormControl('', [
          Validators.required,
          resetPasswordFieldValidator('password'),
        ]),
        newPassword: new FormControl('', [
          Validators.required,
          resetPasswordFieldValidator('newPassword'),
        ]),
        confirmNewPassword: new FormControl('', Validators.required),
      },
      { validators: passwordMatchValidator('newPassword', 'confirmNewPassword') }
    );

    this.form.get('newPassword')!.valueChanges.subscribe((value: string) => {
      this.showChecklist = !!value;
    });
  }

  protected get currentPasswordControl(): FormControl {
    return this.form.get('password') as FormControl;
  }

  protected get newPasswordControl(): FormControl {
    return this.form.get('newPassword') as FormControl;
  }

  protected get confirmPasswordControl(): FormControl {
    return this.form.get('confirmNewPassword') as FormControl;
  }

  protected getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);

    if (fieldName === 'confirmNewPassword' && control?.touched) {
      if (this.form.errors?.['passwordsMismatch']) {
        return this.form.errors['passwordsMismatch'];
      }
    }

    if (!control?.touched || !control?.errors) return '';
    return this.resolveControlError(fieldName, control);
  }

  private resolveControlError(fieldName: string, control: any): string {
    const requiredMessages: Record<string, string> = {
      password: 'La contraseña actual es obligatoria',
      newPassword: 'La nueva contraseña es obligatoria',
      confirmNewPassword: 'Debes confirmar tu nueva contraseña',
    };

    if (control.errors['required']) return requiredMessages[fieldName] ?? 'Este campo es obligatorio';
    if (control.errors[fieldName]) return control.errors[fieldName];
    return 'Contraseña inválida';
  }

  protected get pwdChecks() {
    const v: string = this.newPasswordControl.value ?? '';
    return {
      minLength: v.length >= 8,
      uppercase: /[A-Z]/.test(v),
      lowercase: /[a-z]/.test(v),
      number: /[0-9]/.test(v),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v),
    };
  }

  protected toggleCurrentPassword(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  protected toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  protected toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  protected confirm(): void {
    if (this.isLoading) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.showMessage('Porfavor completa todos los campos correctamente', AlertType.WARNING);
      return;
    }

    const userId = this.sessionService.getUserId();
    if (!userId) {
      this.messageService.showMessage('No se pudo obtener la información del usuario', AlertType.ERROR);
      return;
    }

    this.isLoading = true;
    this.profileService.resetProfilePassword(userId, {
      password: this.currentPasswordControl.value!,
      newPassword: this.newPasswordControl.value!,
    }).subscribe({
      next: (response) => this.handleResetSuccess(response),
      error: (error) => this.handleResetError(error),
    });
  }

  private handleResetSuccess(response: ResetUserPasswordResponse): void {
    this.dialogRef.close(true);
    this.messageService.showMessage(response.message, AlertType.SUCCESS);
  }

  private handleResetError(error: ErrorResponse): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }
}
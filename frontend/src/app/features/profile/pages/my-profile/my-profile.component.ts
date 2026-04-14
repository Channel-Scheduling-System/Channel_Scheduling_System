import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProfileService } from '../../services/profile.service';
import { SessionService } from '../../../../core/services/session.service';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { GetProfileResponse } from '../../models/responses/get-profile-response.model';
import { UpdateProfileRequest } from '../../models/requests/update-profile-request.model';
import { updateProfileFieldValidator } from '../../validators/update-profile.validators';
import { ConfirmUserStateModalComponent } from '../../../users/components/confirm-user-state-modal/confirm-user-state-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { DeactivateProfileResponse } from '../../models/responses/deativate-profile-response.model';
import { ConfirmDeactivateAccountModalComponent } from '../../components/confirm-deactivate-account-modal/confirm-deactivate-account-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss',
})
export class MyProfilePageComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private sessionService: SessionService,
    private messageService: MessageService,
    private router: Router,
    private readonly dialog: MatDialog
  ) { }

  public ngOnInit(): void {
    this.buildForm();
    this.loadProfile();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      alias: ['', [Validators.required, updateProfileFieldValidator('alias')]],
      firstName: ['', [Validators.required, updateProfileFieldValidator('firstName')]],
      lastName: ['', [Validators.required, updateProfileFieldValidator('lastName')]],
      phone: ['', [Validators.required, updateProfileFieldValidator('phone')]],
      email: ['', [Validators.required, Validators.email, updateProfileFieldValidator('email')]],
    });
  }

  private loadProfile(): void {
    const userId = this.sessionService.getUserId();
    if (!userId) {
      this.messageService.showMessage('No se pudo obtener la información del usuario', AlertType.ERROR);
      return;
    }
    this.isLoading = true;
    this.profileService.getProfile(userId).subscribe({
      next: (response) => this.handleLoadSuccess(response),
      error: (error) => this.handleLoadError(error),
    });
  }

  private handleLoadSuccess(response: GetProfileResponse): void {
    const user = response.data;
    this.form.patchValue({
      alias: user.alias,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
    });
    this.isLoading = false;
  }

  private handleLoadError(error: any): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }

  protected getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control?.touched || !control?.errors) return '';
    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors[fieldName]) return control.errors[fieldName];
    if (control.errors['email']) return 'Ingresa un correo válido';
    return '';
  }

  protected saveChanges(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.showMessage('Por favor completa todos los campos correctamente', AlertType.WARNING);
      return;
    }
    const userId = this.sessionService.getUserId();
    if (!userId) {
      this.messageService.showMessage('No se pudo obtener la información del usuario', AlertType.ERROR);
      return;
    }
    this.isSaving = true;
    const payload: UpdateProfileRequest = this.form.value;
    this.profileService.updateProfile(userId, payload).subscribe({
      next: (data) => this.handleSaveSuccess(data),
      error: (error) => this.handleSaveError(error),
    });
  }

  private handleSaveSuccess(data: any): void {
    this.messageService.showMessage(data.message, AlertType.SUCCESS);
    setTimeout(() => {
      window.location.reload();
      this.isSaving = false;
    }, 2500);
  }

  private handleSaveError(error: any): void {
    this.isSaving = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }

  protected resetPassword(): void {
    // TODO: implementar
  }

  protected deactivateAccount(): void {
    const ref = this.dialog.open(ConfirmDeactivateAccountModalComponent, {
      panelClass:    'deactivate-account-panel',
      backdropClass: 'deactivate-account-backdrop',
      autoFocus:     false,
      data:          {},
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.sessionService.clearSession();
      this.router.navigate(['']);
    });
  }
}
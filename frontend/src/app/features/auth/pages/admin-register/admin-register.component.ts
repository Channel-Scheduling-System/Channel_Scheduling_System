import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../users/services/user.service';
import { AdminRegisterRequest, AdminRegisterRequestSchema } from '../../../users/models/requests/register/register-request.model';
import { AdminRegisterResponse } from '../../../../shared/models/admin/admin-register-response.model';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { UserFormFactory } from '../../../users/utils/user-form.factory';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatProgressSpinnerModule, RouterModule],
  templateUrl: './admin-register.component.html',
  styleUrl: './admin-register.component.scss'
})
export class AdminRegisterPageComponent {
  adminRegisterForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  showChecklist = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.adminRegisterForm = UserFormFactory.createRegisterForm(this.fb, 'ADMIN');

    this.adminRegisterForm.get('password')!.valueChanges.subscribe((value: string) => {
      this.showChecklist = !!value;
    });
  }

  get pwdChecks() {
    return UserFormFactory.getPasswordChecks(this.adminRegisterForm.get('password')?.value ?? '');
  }

  public togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  public toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  public getFieldError(fieldName: string): string {
    const control = this.adminRegisterForm.get(fieldName);
    if (fieldName === 'confirmPassword' && this.adminRegisterForm.errors?.['passwordsMismatch']) {
      return this.adminRegisterForm.errors['passwordsMismatch'];
    }
    if (control?.touched && control?.errors) {
      if (control.errors['required'])  return 'Este campo es obligatorio';
      if (control.errors[fieldName])   return control.errors[fieldName];
    }
    return '';
  }

  public onSubmit(): void {
    this.adminRegisterForm.markAllAsTouched();
    if (this.adminRegisterForm.invalid) return;

    this.isLoading = true;

    const credentials: AdminRegisterRequest = {
      ...this.adminRegisterForm.value,
      role: 'ADMIN'
    };
    this.userService.register(credentials, AdminRegisterRequestSchema).subscribe({
      next:  (data)  => this.handleRegisterSuccess(data),
      error: (error) => this.handleRegisterError(error)
    });
  }

  private handleRegisterSuccess(data: AdminRegisterResponse): void {
    this.isLoading = false;
    this.messageService.showMessage(data.message, AlertType.SUCCESS);
    this.router.navigate(['/auth/login']);
  }

  private handleRegisterError(error: any): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }
}
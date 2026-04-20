import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../users/services/user.service';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { UserFormFactory } from '../../../users/utils/user-form.factory';
import { Router } from '@angular/router';
import { RegisterClientRequest } from '../../models/requests/register-client-request.model';
import { AuthService } from '../../services/auth.service';
import { RegisterClientResponse } from '../../models/responses/register-client-response.model';
import { ErrorResponse } from '../../../../shared/models/api/error-response.schema';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatProgressSpinnerModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterPageComponent {
  protected registerForm: FormGroup;
  protected showPassword = false;
  protected showConfirmPassword = false;
  protected isLoading = false;
  protected showChecklist = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.registerForm = UserFormFactory.createRegisterForm(this.fb, 'CLIENT');
    this.registerForm.get('password')!.valueChanges.subscribe((value: string) => {
      this.showChecklist = !!value;
    });
  }

  protected get pwdChecks() {
    return UserFormFactory.getPasswordChecks(this.registerForm.get('password')?.value ?? '');
  }

  public togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  public toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  public getFieldError(fieldName: string): string {
    const control = this.registerForm.get(fieldName);
    if (fieldName === 'confirmPassword' && this.registerForm.errors?.['passwordsMismatch']) {
      return this.registerForm.errors['passwordsMismatch'];
    }
    if (control?.touched && control?.errors) {
      if (control.errors['required'])    return 'Este campo es obligatorio';
      if (control.errors[fieldName])     return control.errors[fieldName];
    }
    return '';
  }

  public onSubmit(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;

    this.isLoading = true;

    const { confirmPassword, ...rest } = this.registerForm.value;
    const request: RegisterClientRequest = rest;

    this.authService.registerClientAndLogin(request).subscribe({
      next:  (response)  => this.handleRegisterSuccess(response),
      error: (error) => this.handleRegisterError(error)
    });

  }

  private handleRegisterSuccess(response: RegisterClientResponse): void {
    this.isLoading = false;
    this.messageService.showMessage(response.message, AlertType.SUCCESS);
    this.router.navigate(['/home']);
  }

  private handleRegisterError(error: ErrorResponse): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }
}
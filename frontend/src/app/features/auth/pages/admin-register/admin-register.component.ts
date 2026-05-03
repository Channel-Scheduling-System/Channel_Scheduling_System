import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { UserFormFactory } from '../../../users/utils/user-form.factory';
import { Router } from '@angular/router';
import { passwordMatchValidator, registerFirstAdminFieldValidator } from '../../validators/register-first-admin.validators';
import { RegisterFirstAdminRequest } from '../../models/requests/register-first-admin-request.model';
import { AuthService } from '../../services/auth.service';
import { RegisterFirstAdminResponse } from '../../models/responses/register-first-admin-response.model';
import { ErrorResponse } from '../../../../shared/models/api/error-response.schema';

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatProgressSpinnerModule, RouterModule],
  templateUrl: './admin-register.component.html',
  styleUrl: './admin-register.component.scss'
})
export class AdminRegisterPageComponent {
  protected adminRegisterForm!: FormGroup;
  protected showPassword = false;
  protected showConfirmPassword = false;
  protected isLoading = false;
  protected showChecklist = false;
  protected showSecretCode = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
  }

  public ngOnInit(): void {
    this.buildForm();
    this.adminRegisterForm.get('password')!.valueChanges.subscribe((value: string) => {
      this.showChecklist = !!value;
    });
  } 

  private buildForm(): void {
    this.adminRegisterForm = this.fb.group(
      {
        alias:           ['', [Validators.required, registerFirstAdminFieldValidator('alias')]],
        firstName:       ['', [Validators.required, registerFirstAdminFieldValidator('firstName')]],
        lastName:        ['', [Validators.required, registerFirstAdminFieldValidator('lastName')]],
        phone:           ['', [Validators.required, registerFirstAdminFieldValidator('phone')]],
        email:           ['', [Validators.required, registerFirstAdminFieldValidator('email')]],
        password:        ['', [Validators.required, registerFirstAdminFieldValidator('password')]],
        confirmPassword: ['', Validators.required],
        secretCode:      ['', [Validators.required, registerFirstAdminFieldValidator('secretCode')]],
      },
      { validators: passwordMatchValidator('password', 'confirmPassword') }
    );
  }

  protected get pwdChecks() {
    return UserFormFactory.getPasswordChecks(this.adminRegisterForm.get('password')?.value ?? '');
  }

  public togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  public toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  public toggleSecretCode(): void {
    this.showSecretCode = !this.showSecretCode;
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

    const { confirmPassword, ...rest } = this.adminRegisterForm.value;
    const request: RegisterFirstAdminRequest = rest;

    this.authService.registerFirstAdmin(request).subscribe({
      next:  (response)  => this.handleRegisterSuccess(response),
      error: (error) => this.handleRegisterError(error)
    });
  }

  private handleRegisterSuccess(response: RegisterFirstAdminResponse): void {
    this.isLoading = false;
    this.messageService.showMessage(response.message, AlertType.SUCCESS);
    this.router.navigate(['/auth/login']);
  }

  private handleRegisterError(error: ErrorResponse): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }
}
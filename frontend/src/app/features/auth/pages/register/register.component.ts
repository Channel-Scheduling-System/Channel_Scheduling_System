import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CustomerRegisterRequest } from '../../models/requests/register/register-request.model';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { passwordMatchValidator, registerFieldValidator } from '../../validators/register.validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatProgressSpinnerModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterPageComponent {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  showChecklist = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.registerForm = this.fb.group({
      alias: ['', [Validators.required, registerFieldValidator('alias')]],
      firstName: ['', [Validators.required, registerFieldValidator('firstName')]],
      lastName:  ['', [Validators.required, registerFieldValidator('lastName')]],
      phone:     ['', [Validators.required, registerFieldValidator('phone')]],
      email:     ['', [Validators.required, registerFieldValidator('email')]],
      password:  ['', [Validators.required, registerFieldValidator('password')]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: passwordMatchValidator('password', 'confirmPassword')
    });

    this.registerForm.get('password')!.valueChanges.subscribe((value: string) => {
      this.showChecklist = !!value;
    });
  }

  get pwdChecks() {
    const value: string = this.registerForm.get('password')?.value ?? '';
    return {
      minLength: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number:    /[0-9]/.test(value),
      special:   /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
    };
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

    const credentials: CustomerRegisterRequest = {
      ...this.registerForm.value,
      role: 'CLIENT'
    };

    this.authService.register(credentials).subscribe({
      next:  (data)  => this.handleRegisterSuccess(data),
      error: (error) => this.handleRegisterError(error)
    });
  }

  private handleRegisterSuccess(data: any): void {
    this.isLoading = false;
    this.messageService.showMessage(data.message, AlertType.SUCCESS);
  }

  private handleRegisterError(error: any): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }
}
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../users/services/user.service';
import { ClientRegisterRequest, ClientRegisterRequestSchema } from '../../../users/models/requests/register/register-request.model';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { UserFormFactory } from '../../../users/utils/user-form.factory';
import { Router } from '@angular/router';

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
    private userService: UserService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.registerForm = UserFormFactory.createRegisterForm(this.fb, 'CLIENT');
    this.registerForm.get('password')!.valueChanges.subscribe((value: string) => {
      this.showChecklist = !!value;
    });
  }

  get pwdChecks() {
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

    const credentials: ClientRegisterRequest = {
      ...this.registerForm.value,
      role: 'CLIENT'
    };

    this.userService.register(credentials, ClientRegisterRequestSchema).subscribe({
      next:  (data)  => this.handleRegisterSuccess(data),
      error: (error) => this.handleRegisterError(error)
    });
  }

  private handleRegisterSuccess(data: any): void {
    this.isLoading = false;
    this.messageService.showMessage(data.message, AlertType.SUCCESS);
    this.router.navigate(['/services']);
  }

  private handleRegisterError(error: any): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }
}
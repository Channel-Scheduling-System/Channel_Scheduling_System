import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/requests/login/login-request.model';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { loginFieldValidator } from '../../validators/login.validators';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatProgressSpinnerModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginPageComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [
        Validators.required,
        loginFieldValidator('identifier')
      ]],
      password: ['', [
        Validators.required,
        loginFieldValidator('password')
      ]]
    });
  }

  public togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  public getFieldError(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) {
        return 'Este campo es obligatorio';
      }
      if (control.errors[fieldName]) {
        return control.errors[fieldName];
      }
    }
    return '';
  }

  public onSubmit(): void {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) {
      return;
    }
    this.isLoading = true;
    const credentials: LoginRequest = this.loginForm.value;
    this.authService.login(credentials).subscribe({
      next: (data) => this.handleLoginSuccess(data),
      error: (error) => this.handleLoginError(error)
    });
  }

  private handleLoginSuccess(data: any): void {
    this.isLoading = false;
    this.messageService.showMessage(data.message, AlertType.SUCCESS);
    this.router.navigate(['/home']);
  }

  private handleLoginError(error: any): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }
}
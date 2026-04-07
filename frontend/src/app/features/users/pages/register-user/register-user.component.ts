import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../services/user.service';
import { MessageService } from '../../../../core/services/message.service';
import { SessionService } from '../../../../core/services/session.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { UserFormFieldsComponent } from '../../components/user-form-fields/user-form-fields.component';
import { UserFormHeaderComponent } from '../../components/user-form-header/user-form-header.component';
import {
  registerUserFieldValidator,
  passwordMatchValidator,
} from './../../validators/register-user.validators';
import { RegisterUserRequestSchema } from '../../models/requests/register/register-request.model';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    UserFormFieldsComponent,
    UserFormHeaderComponent,
  ],
  templateUrl: './register-user.component.html',
  styleUrl: './register-user.component.scss',
})
export class RegisterUserPageComponent implements OnInit {
  form!: FormGroup;
  isAdmin    = false;
  isLoading  = false;

  showPassword        = false;
  showConfirmPassword = false;
  showChecklist       = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private messageService: MessageService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.isAdmin = this.sessionService.getRole() === 'ADMIN';
    this.buildForm();

    this.form.get('password')!.valueChanges.subscribe((value: string) => {
      this.showChecklist = !!value;
    });
  }

  private buildForm(): void {
    this.form = this.fb.group(
      {
        alias:     ['', [Validators.required, registerUserFieldValidator('alias')]],
        firstName: ['', [Validators.required, registerUserFieldValidator('firstName')]],
        lastName:  ['', [Validators.required, registerUserFieldValidator('lastName')]],
        phone:     ['', [Validators.required, registerUserFieldValidator('phone')]],
        email:     ['', [Validators.required, Validators.email, registerUserFieldValidator('email')]],
        role:      [this.isAdmin ? 'CUSTOMER' : 'CUSTOMER', this.isAdmin ? Validators.required : []],
        password:        ['', [Validators.required, registerUserFieldValidator('password')]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator('password', 'confirmPassword') }
    );
  }

  get passwordControl(): FormControl {
    return this.form.get('password') as FormControl;
  }

  get confirmPasswordControl(): FormControl {
    return this.form.get('confirmPassword') as FormControl;
  }

  get pwdChecks() {
    const v: string = this.form.get('password')?.value ?? '';
    return {
      minLength: v.length >= 8,
      uppercase: /[A-Z]/.test(v),
      lowercase: /[a-z]/.test(v),
      number:    /[0-9]/.test(v),
      special:   /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v),
    };
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getFieldError(fieldName: string): string {
    if (
      fieldName === 'confirmPassword' &&
      this.form.errors?.['passwordsMismatch'] &&
      this.form.get('confirmPassword')?.touched
    ) {
      return this.form.errors['passwordsMismatch'];
    }
    const control = this.form.get(fieldName);
    if (!control?.touched || !control?.errors) return '';
    if (control.errors['required'])  return 'Este campo es obligatorio';
    if (control.errors[fieldName])   return control.errors[fieldName];
    if (control.errors['email'])     return 'Ingresa un correo válido';
    return '';
  }

  registerUser(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.showMessage('Porfavor completa todos los campos correctamente', AlertType.WARNING);     
      return;
    }
    this.isLoading = true;
    const { confirmPassword, ...rest } = this.form.value;
    const payload: RegisterUserRequestSchema = rest;
    this.userService.registerUser(payload).subscribe({
      next:  (data)  => this.handleSuccess(data),
      error: (error) => this.handleError(error),
    });
  }

  private handleSuccess(data: any): void {
    this.isLoading = false;
    this.messageService.showMessage(data.message, AlertType.SUCCESS);
    this.router.navigate(['/users']);
  }

  private handleError(error: any): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../services/user.service';
import { MessageService } from '../../../../core/services/message.service';
import { SessionService } from '../../../../core/services/session.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { UserFormFieldsComponent } from '../../components/user-form-fields/user-form-fields.component';
import { UserFormHeaderComponent } from '../../components/user-form-header/user-form-header.component';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatProgressSpinnerModule, UserFormFieldsComponent, UserFormHeaderComponent],
  templateUrl: './register-user.component.html',
  styleUrl: './register-user.component.scss',
})
export class RegisterUserPageComponent implements OnInit {
  form!: FormGroup;
  isAdmin = false;

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
  }

  private buildForm(): void {
    this.form = this.fb.group(
      {
        alias:           ['', Validators.required],
        firstName:       ['', Validators.required],
        lastName:        ['', Validators.required],
        phone:           ['', Validators.required],
        email:           ['', [Validators.required, Validators.email]],
        role:            [this.isAdmin ? '' : 'CLIENT', this.isAdmin ? Validators.required : []],
        password:        ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );
  }

  get passwordControl(): FormControl {
    return this.form.get('password') as FormControl;
  }

  get confirmPasswordControl(): FormControl {
    return this.form.get('confirmPassword') as FormControl;
  }

  registerUser(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // TODO: implementar
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
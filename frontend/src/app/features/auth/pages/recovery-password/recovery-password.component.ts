import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { ErrorResponse } from '../../../../shared/models/api/error-response.schema';
import { SendRecoveryCodeRequest } from '../../models/requests/send-code-requests.model';
import { VerifyRecoveryCodeRequest } from '../../models/requests/verify-code-request.model';
import { PasswordRecoveryRequest } from '../../models/requests/recovery-password-request.model';
import { SendRecoveryCodeResponse } from '../../models/responses/send-code-response.model';
import { VerifyRecoveryCodeResponse } from '../../models/responses/verify-code-response.model';
import { PasswordRecoveryResponse } from '../../models/responses/recovery-password-response.model';
import { phase1FieldValidator, phase3FieldValidator, codeValidator } from '../../validators/recovery-password.validators';
import { UserFormFactory } from '../../../users/utils/user-form.factory';

@Component({
  selector: 'app-recovery-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatProgressSpinnerModule, RouterModule],
  templateUrl: './recovery-password.component.html',
  styleUrl: './recovery-password.component.scss',
})
export class RecoveryPasswordPageComponent implements OnInit {
  @ViewChildren('digit') private digitInputs!: QueryList<ElementRef<HTMLInputElement>>;

  protected step: 1 | 2 | 3 = 1;
  protected totalSteps = 3;
  protected isLoading = false;
  protected showPassword = false;
  protected showConfirmPassword = false;
  protected showChecklist = false;
  private email: string = '';

  protected phase1Form!: FormGroup;
  protected phase2Form!: FormGroup;
  protected phase3Form!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly messageService: MessageService,
    private readonly router: Router
  ) {}

  public ngOnInit(): void {
    this.buildForms();
  }

  private buildForms(): void {
    this.phase1Form = this.fb.group({
      email: ['', [Validators.required, phase1FieldValidator('email')]],
    });

    this.phase2Form = this.fb.group({
      code: ['', [Validators.required, codeValidator()]],
    });

    const passwordsMatchValidator = (group: AbstractControl): ValidationErrors | null => {
      const pwd     = group.get('newPassword')?.value;
      const confirm = group.get('confirmPassword')?.value;
      return pwd === confirm ? null : { passwordsMismatch: 'Las contraseñas no coinciden' };
    };

    this.phase3Form = this.fb.group({
      newPassword:     ['', [Validators.required, phase3FieldValidator('newPassword')]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: passwordsMatchValidator });

    this.phase3Form.get('newPassword')!.valueChanges.subscribe((value: string) => {
      this.showChecklist = !!value;
    });
  }

  protected get stepTitle(): string {
    const titles: Record<number, string> = {
      1: 'IDENTIFICACIÓN',
      2: 'VERIFICACIÓN DE CÓDIGO',
      3: 'ASIGNAR NUEVA CONTRASEÑA',
    };
    return titles[this.step];
  }

  protected get pwdChecks() {
    return UserFormFactory.getPasswordChecks(this.phase3Form.get('newPassword')?.value ?? '');
  }

  protected onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').slice(-1);
    if (input.value && index < 5) {
      this.digitInputs.get(index + 1)?.nativeElement.focus();
    }
    this.syncCodeValue();
  }

  protected onDigitKeydown(event: KeyboardEvent, index: number): void {
    if (event.ctrlKey || event.metaKey) return;
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'];
    if (!/^\d$/.test(event.key) && !allowed.includes(event.key)) {
      event.preventDefault();
    }
    if (event.key === 'Backspace') {
      const input = event.target as HTMLInputElement;
      if (!input.value && index > 0) {
        this.digitInputs.get(index - 1)?.nativeElement.focus();
      }
    }
  }

  protected onDigitPaste(event: ClipboardEvent, startIndex: number): void {
    event.preventDefault();
    const digits = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, 6 - startIndex);
    const inputs = this.digitInputs.toArray();
    digits.split('').forEach((d, i) => {
      if (inputs[startIndex + i]) inputs[startIndex + i].nativeElement.value = d;
    });
    this.syncCodeValue();
    inputs[Math.min(startIndex + digits.length, 5)]?.nativeElement.focus();
  }

  private syncCodeValue(): void {
    const code = this.digitInputs.toArray().map(el => el.nativeElement.value).join('');
    const control = this.phase2Form.get('code');
    control?.setValue(code);
    control?.markAsTouched();
  }

  protected sendCode(): void {
    this.phase1Form.markAllAsTouched();
    if (this.phase1Form.invalid) {
      this.messageService.showMessage('Porfavor completa el campo correctamente', AlertType.WARNING);
      return;
    }
    this.isLoading = true;
    const request: SendRecoveryCodeRequest = this.phase1Form.value;
    this.email = request.email;
    this.authService.sendRecoveryCode(request).subscribe({
      next:  (response) => this.handleSendCodeSuccess(response),
      error: (error)    => this.handleSendCodeError(error),
    });
  }

  private handleSendCodeSuccess(response: SendRecoveryCodeResponse): void {
    this.isLoading = false;
    this.messageService.showMessage(response.message, AlertType.SUCCESS);
    this.step = 2;
  }

  private handleSendCodeError(error: ErrorResponse): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }

  protected resendCode(): void {
    if (this.phase1Form.invalid) {
      this.messageService.showMessage('Porfavor completa el campo correctamente', AlertType.WARNING);
      return;
    }
    this.isLoading = true;
    const request: SendRecoveryCodeRequest = this.phase1Form.value;
    this.authService.sendRecoveryCode(request).subscribe({
      next:  (response) => this.handleResendCodeSuccess(response),
      error: (error)    => this.handleSendCodeError(error),
    });
  }

  private handleResendCodeSuccess(response: SendRecoveryCodeResponse): void {
    this.isLoading = false;
    this.messageService.showMessage(response.message, AlertType.SUCCESS);
  }

  protected verifyCode(): void {
    this.phase2Form.markAllAsTouched();
    if (this.phase2Form.invalid) {
      this.messageService.showMessage('Porfavor completa el campo correctamente', AlertType.WARNING);
      return;
    }
    this.isLoading = true;
    const request: VerifyRecoveryCodeRequest = {
      email: this.email,
      code: this.phase2Form.get('code')?.value,
    };
    this.authService.verifyRecoveryCode(request).subscribe({
      next:  (response) => this.handleVerifyCodeSuccess(response),
      error: (error)    => this.handleVerifyCodeError(error),
    });
  }

  private handleVerifyCodeSuccess(response: VerifyRecoveryCodeResponse): void {
    this.isLoading = false;
    this.messageService.showMessage(response.message, AlertType.SUCCESS);
    this.step = 3;
  }

  private handleVerifyCodeError(error: ErrorResponse): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }

  protected resetPassword(): void {
    this.phase3Form.markAllAsTouched();
    if (this.phase3Form.invalid) {
      this.messageService.showMessage('Porfavor completa todos los campos correctamente', AlertType.WARNING);
      return;
    }
    this.isLoading = true;
    const request: PasswordRecoveryRequest = {
      newPassword: this.phase3Form.get('newPassword')?.value,
    };
    this.authService.recoveryPassword(request).subscribe({
      next:  (response) => this.handleResetPasswordSuccess(response),
      error: (error)    => this.handleResetPasswordError(error),
    });
  }

  private handleResetPasswordSuccess(response: PasswordRecoveryResponse): void {
    this.isLoading = false;
    this.messageService.showMessage(response.message, AlertType.SUCCESS);
    this.router.navigate(['/auth/login']);
  }

  private handleResetPasswordError(error: ErrorResponse): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }

  public togglePassword(): void        { this.showPassword        = !this.showPassword; }
  public toggleConfirmPassword(): void { this.showConfirmPassword = !this.showConfirmPassword; }

  protected getPhase1Error(fieldName: string): string {
    return this.resolveFieldError(this.phase1Form, fieldName);
  }

  protected getPhase2Error(fieldName: string): string {
    return this.resolveFieldError(this.phase2Form, fieldName);
  }

  protected getPhase3Error(fieldName: string): string {
    if (fieldName === 'confirmPassword') {
      const control = this.phase3Form.get('confirmPassword');
      if (!control?.touched) return '';
      if (control.errors?.['required']) return 'Este campo es obligatorio';
      if (control.value && this.phase3Form.errors?.['passwordsMismatch']) {
        return this.phase3Form.errors['passwordsMismatch'];
      }
      return '';
    }
    return this.resolveFieldError(this.phase3Form, fieldName);
  }

  private resolveFieldError(form: FormGroup, fieldName: string): string {
    const control = form.get(fieldName);
    if (!control?.touched || !control?.errors) return '';
    if (control.errors['required'])  return 'Este campo es obligatorio';
    if (control.errors[fieldName])   return control.errors[fieldName];
    return '';
  }
}
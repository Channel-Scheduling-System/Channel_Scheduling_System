import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../services/user.service';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { UserFormFieldsComponent } from '../../components/user-form-fields/user-form-fields.component';
import { UserFormHeaderComponent } from '../../components/user-form-header/user-form-header.component';
import { updateUserFieldValidator } from '../../validators/update-user.validators';
import { UpdateUserRequest } from '../../models/requests/update/update-request.model';
import { GetUserResponse } from '../../models/responses/get-user/get-profile-response.model';

@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    UserFormFieldsComponent,
    UserFormHeaderComponent,
  ],
  templateUrl: './update-user.component.html',
  styleUrl: './update-user.component.scss',
})
export class UpdateUserPageComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  isSaving  = false;
  private userId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.userId = +this.route.snapshot.paramMap.get('id')!;
    this.buildForm();
    this.loadUser();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      alias:     ['', [Validators.required, updateUserFieldValidator('alias')]],
      firstName: ['', [Validators.required, updateUserFieldValidator('firstName')]],
      lastName:  ['', [Validators.required, updateUserFieldValidator('lastName')]],
      phone:     ['', [Validators.required, updateUserFieldValidator('phone')]],
      email:     ['', [Validators.required, Validators.email, updateUserFieldValidator('email')]],
    });
  }

  private loadUser(): void {
    this.isLoading = true;
    this.userService.getUserById(this.userId).subscribe({
      next:  (response) => this.handleLoadSuccess(response),
      error: (error)    => this.handleLoadError(error),
    });
  }

  private handleLoadSuccess(response: GetUserResponse): void {
    const user = response.data;
    this.form.patchValue({
      alias:     user.alias,
      firstName: user.firstName,
      lastName:  user.lastName,
      phone:     user.phone,
      email:     user.email,
    });
    this.isLoading = false;
  }

  private handleLoadError(error: any): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }

  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control?.touched || !control?.errors) return '';
    if (control.errors['required'])  return 'Este campo es obligatorio';
    if (control.errors[fieldName])   return control.errors[fieldName];
    if (control.errors['email'])     return 'Ingresa un correo válido';
    return '';
  }

  saveChanges(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.showMessage('Por favor completa todos los campos correctamente', AlertType.WARNING);
      return;
    }
    this.isSaving = true;
    const payload: UpdateUserRequest = this.form.value;
    this.userService.updateUser(this.userId, payload).subscribe({
      next:  (data)  => this.handleSaveSuccess(data),
      error: (error) => this.handleSaveError(error),
    });
  }

  private handleSaveSuccess(data: any): void {
    this.isSaving = false;
    this.messageService.showMessage(data.message, AlertType.SUCCESS);
    this.router.navigate(['/users']);
  }

  private handleSaveError(error: any): void {
    this.isSaving = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  deactivateUser(): void {
    // TODO: implementar
  }
}
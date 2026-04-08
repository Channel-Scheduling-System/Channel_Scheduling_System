import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { UserFormFieldsComponent } from '../../components/user-form-fields/user-form-fields.component';
import { UserFormHeaderComponent } from '../../components/user-form-header/user-form-header.component';
import { updateUserFieldValidator } from '../../validators/update-user.validators';
import { UpdateUserRequest } from '../../models/requests/update/update-request.model';
import { GetUserResponse } from '../../models/responses/get-user/get-user-response.model';
import { ConfirmUserStateModalComponent } from '../../components/confirm-user-state-modal/confirm-user-state-modal.component';
import { SetStateUserResponse } from '../../models/responses/set-state-user/set-state-user-response.model';
import { SetStateUserRequest } from '../../models/requests/set-state-user/set-state-user-request.model';
import { UpdateUserResponse } from '../../models/responses/update-user/update-response.model';

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
  isLoading      = false;
  isSaving       = false;
  userIsActive   = true;
  stateDropdownOpen = false;
  private userId!: number;

  readonly stateOptions = [
    { value: true,  label: 'Activo',   icon: 'check_circle'  },
    { value: false, label: 'Inactivo', icon: 'cancel'        },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private messageService: MessageService,
    private dialog: MatDialog
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
    this.userIsActive = user.isActive ?? true;
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

  get currentStateOption() {
    return this.stateOptions.find(o => o.value === this.userIsActive)!;
  }

  toggleStateDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.stateDropdownOpen = !this.stateDropdownOpen;
  }

  requestStateChange(newState: boolean, event: MouseEvent): void {
    event.stopPropagation();
    this.stateDropdownOpen = false;
    if (newState === this.userIsActive) return;

    const ref = this.dialog.open(ConfirmUserStateModalComponent, {
      data: { isActive: newState },
      panelClass:    'confirm-state-panel',
      backdropClass: 'confirm-state-backdrop',
      maxWidth:      '460px',
      width:         '90vw',
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.setUserState(newState);
    });
  }

  private setUserState(isActive: boolean): void {
      const request: SetStateUserRequest = { isActive };
      this.userService.setUserState(this.userId, request).subscribe({
        next:  (data)  => this.handleStateSuccess(data, isActive),
        error: (error) => this.handleStateError(error),
      });
  }

  private handleStateSuccess(data: SetStateUserResponse, isActive: boolean): void {
    this.userIsActive = isActive;
    this.messageService.showMessage(data.message, AlertType.SUCCESS);
  }

  private handleStateError(error: any): void {
    this.messageService.showMessage(error.message, AlertType.ERROR);
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

  private handleSaveSuccess(data: UpdateUserResponse): void {
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

  @HostListener('document:click')
  onDocumentClick(): void {
    this.stateDropdownOpen = false;
  }
}
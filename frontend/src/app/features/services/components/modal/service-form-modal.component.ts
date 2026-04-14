import { Component, EventEmitter, Input, Output, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { serviceFieldValidator } from '../../validators/create-service.validators';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ServiceFormModalData } from '../../../auth/interfaces/modal-data.interface';
import { DEFAULT_SERVICE_COLOR, SERVICE_COLOR_PALETTE } from '../../../../shared/constants/color-palete-constants';

@Component({
  selector: 'app-service-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './service-form-modal.component.html',
  styleUrls: ['./service-form-modal.component.scss']
})
export class ServiceFormModalComponent implements OnInit {

  readonly colorPalette = SERVICE_COLOR_PALETTE;

  isEditMode = false;
  serviceId?: number;
  serviceForm!: FormGroup;
  isSubmitting = false;
  selectedColor = DEFAULT_SERVICE_COLOR;
  showColorPicker = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ServiceFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ServiceFormModalData
  ) {
    this.isEditMode = data?.isEdit || false;
    this.serviceId = data?.service?.id;
  }

  ngOnInit(): void {
    this.buildForm();
    if (this.isEditMode && this.data?.service) {
      this.serviceForm.patchValue({
        name: this.data.service.name,
        description: this.data.service.description,
        price: this.data.service.price,
        duration: this.data.service.duration
      });
      this.selectedColor = this.data.service.color;
    }
  }

  private buildForm(): void {
    this.serviceForm = this.fb.group({
      name:        ['', [Validators.required, serviceFieldValidator('name')]],
      description: ['', [serviceFieldValidator('description')]],
      price:       [null, [Validators.required, serviceFieldValidator('price')]],
      duration:    [null, [Validators.required, serviceFieldValidator('duration')]],
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.serviceForm.get(fieldName);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Este campo es obligatorio';
      if (control.errors[fieldName]) return control.errors[fieldName];
    }
    return '';
  }

  onSubmit(): void {
    this.serviceForm.markAllAsTouched();
    if (this.serviceForm.invalid) return;
    
    this.isSubmitting = true;
    const formValue = this.serviceForm.value;

    const request = {
      name: formValue.name?.trim(),
      description: formValue.description?.trim(),
      price: formValue.price,
      duration: formValue.duration,
      color: this.selectedColor,
    };
    this.data.onSubmit?.(request);
  }

  setSubmitting(isSubmitting: boolean): void {
    this.isSubmitting = isSubmitting;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  selectColor(color: string): void {
    this.selectedColor = color;
    this.showColorPicker = false;
  }

  toggleColorPicker(): void {
    this.showColorPicker = !this.showColorPicker;
  }

  onColorInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedColor = input.value;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Editar Servicio' : 'Nuevo Servicio';
  }

  get modalSubtitle(): string {
    return this.isEditMode 
      ? 'Actualiza los detalles de tu servicio' 
      : 'Define los detalles de tu nueva oferta de belleza';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Actualizar Servicio' : 'Crear Servicio';
  }

  get submitIcon(): string {
    return this.isEditMode ? 'check' : 'arrow_forward';
  }

  get loadingText(): string {
    return this.isEditMode ? 'Actualizando...' : 'Guardando...';
  }

}
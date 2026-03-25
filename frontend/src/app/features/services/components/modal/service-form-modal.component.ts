import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { createServiceFieldValidator } from '../../validators/create-service.validators';
import { MatDialogRef } from '@angular/material/dialog';

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
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  serviceForm!: FormGroup;
  isSubmitting = false;
  selectedColor = '#4A0E0E';
  showColorPicker = false;

  readonly colorPalette: string[] = [
    '#4A0E0E', '#8B0000', '#C0392B', '#D4AF37', '#FFD700', '#F39C12',
    '#1A5276', '#117A65', '#1E8449', '#6C3483', '#2C3E50', '#566573'
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ServiceFormModalComponent>) {}

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.serviceForm = this.fb.group({
      name:        ['', [Validators.required, createServiceFieldValidator('name')]],
      description: ['', [Validators.required, createServiceFieldValidator('description')]],
      price:       [null, [Validators.required, createServiceFieldValidator('price')]],
      duration:    [null, [Validators.required, createServiceFieldValidator('duration')]],
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

  onSubmit(): void {
    this.serviceForm.markAllAsTouched();
    if (this.serviceForm.invalid) return;
    /*
    this.isSubmitting = true;
    const request = {
      ...this.serviceForm.value,
      color: this.selectedColor,
    };
    this.save.emit(request);*/
  }

  onCancel(): void {
    this.close.emit();
  }
}
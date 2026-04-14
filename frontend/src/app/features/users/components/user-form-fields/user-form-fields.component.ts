import { Component, Input, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-user-form-fields',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form-fields.component.html',
  styleUrl: './user-form-fields.component.scss',
})
export class UserFormFieldsComponent {
  @Input({ required: true }) public formGroup!: FormGroup;
  @Input() public showRole = false;

  protected roleDropdownOpen = false;

  protected readonly roleOptions = [
    { value: 'CUSTOMER', label: 'Cliente'        },
    { value: 'WORKER',   label: 'Trabajador'     },
    { value: 'ADMIN',    label: 'Administrador' },
  ];

  private readonly roleLabels: Record<string, string> = {
    ADMIN:    'Administrador',
    CUSTOMER: 'Cliente',
    WORKER:   'Trabajador',
  };

  constructor(private readonly el: ElementRef) {}

  protected get selectedRoleLabel(): string {
    const value = this.formGroup.get('role')?.value;
    return value ? this.roleLabels[value] : 'Seleccionar rol';
  }

  protected get hasRoleValue(): boolean {
    return !!this.formGroup.get('role')?.value;
  }

  protected toggleRoleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.roleDropdownOpen = !this.roleDropdownOpen;
  }

  protected selectRole(value: string, event: MouseEvent): void {
    event.stopPropagation();
    this.formGroup.get('role')?.setValue(value);
    this.formGroup.get('role')?.markAsTouched();
    this.roleDropdownOpen = false;
  }

  protected getFieldError(fieldName: string): string {
    const control = this.formGroup.get(fieldName);
    if (!control?.touched || !control?.errors) return '';
    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors[fieldName])  return control.errors[fieldName];
    if (control.errors['email'])    return 'Ingresa un correo válido';
    return '';
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.roleDropdownOpen = false;
    }
  }
}
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
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() showRole = false;

  roleDropdownOpen = false;

  readonly roleOptions = [
    { value: 'ADMIN',   label: 'Administrador' },
    { value: 'CLIENT',  label: 'Cliente'        },
    { value: 'WORKER',  label: 'Trabajador'     },
  ];

  private readonly roleLabels: Record<string, string> = {
    ADMIN:   'Administrador',
    CLIENT:  'Cliente',
    WORKER:  'Trabajador',
  };

  constructor(private el: ElementRef) {}

  get selectedRoleLabel(): string {
    const value = this.formGroup.get('role')?.value;
    return value ? this.roleLabels[value] : 'Seleccionar rol';
  }

  get hasRoleValue(): boolean {
    return !!this.formGroup.get('role')?.value;
  }

  toggleRoleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.roleDropdownOpen = !this.roleDropdownOpen;
  }

  selectRole(value: string, event: MouseEvent): void {
    event.stopPropagation();
    this.formGroup.get('role')?.setValue(value);
    this.formGroup.get('role')?.markAsTouched();
    this.roleDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.roleDropdownOpen = false;
    }
  }
}
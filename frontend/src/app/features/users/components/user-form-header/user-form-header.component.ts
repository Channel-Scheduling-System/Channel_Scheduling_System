import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-form-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-form-header.component.html',
  styleUrl: './user-form-header.component.scss',
})
export class UserFormHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() eyebrow?: string;
  @Input() description?: string;
  @Output() back = new EventEmitter<void>();

  goBack(): void {
    this.back.emit();
  }
}
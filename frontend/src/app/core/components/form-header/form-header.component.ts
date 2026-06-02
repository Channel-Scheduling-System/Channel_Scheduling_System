import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-header.component.html',
  styleUrl: './form-header.component.scss',
})
export class FormHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() eyebrow?: string;
  @Input() description?: string;
  @Output() back = new EventEmitter<void>();

  goBack(): void {
    this.back.emit();
  }
}
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmUserStateModalData {
  isActive: boolean;
}

@Component({
  selector: 'app-confirm-user-state-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-user-state-modal.component.html',
  styleUrl: './confirm-user-state-modal.component.scss',
})
export class ConfirmUserStateModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmUserStateModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmUserStateModalData
  ) {}

  get isActivating(): boolean {
    return this.data.isActive;
  }

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-icon-snackbar',
  template: `
    <div class="snack-layout">
      <span class="material-symbols-outlined snack-icon">{{ icon }}</span>
      <span class="snack-message">{{ data.message }}</span>
      <button class="snack-close" (click)="dismiss()">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .snack-layout {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 0.5rem;
    }

    .snack-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .snack-message {
      flex: 1;
      text-align: center;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .snack-close {
      flex-shrink: 0;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.15rem;
      display: flex;
      align-items: center;
      opacity: 0.85;
      border-radius: 4px;
      transition: opacity 0.2s ease, background-color 0.2s ease;

      .material-symbols-outlined {
        font-size: 18px;
      }

      &:hover {
        opacity: 1;
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
  `]
})
export class IconSnackbarComponent {
  icon: string;

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: { message: string; type: string },
    private snackBarRef: MatSnackBarRef<IconSnackbarComponent>
  ) {
    this.icon = this.getIconForType(data.type);
  }

  private getIconForType(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error':   return 'error';
      case 'warning': return 'warning';
      default:        return 'info';
    }
  }

  dismiss(): void {
    this.snackBarRef.dismiss();
  }
}
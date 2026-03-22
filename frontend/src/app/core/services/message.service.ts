import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IconSnackbarComponent } from '../components/icon-snackbar/icon-snackbar.component';
import { IMessageService } from '../interfaces/message-service.interface';

export type SnackBarType = 'success' | 'error' | 'warning';

@Injectable({ providedIn: 'root' })
export class MessageService implements IMessageService {
  
  constructor(private snackBar: MatSnackBar) {}

  showMessage(message: string, type: SnackBarType): void {
    this.snackBar.openFromComponent(IconSnackbarComponent, {
      duration: 3000,
      panelClass: [`${type}-snackbar`],
      data: { message, type }
    });
  }
}
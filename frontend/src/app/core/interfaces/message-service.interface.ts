export type SnackBarType = 'success' | 'error' | 'warning';

export interface IMessageService {
  
  showMessage(message: string, type: SnackBarType): void;
}
export interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
}
export interface HintSlot {
  type:    'timeoff' | 'periodoff' | 'dayoff';
  reason:  string;
  startEl: HTMLElement;
  visible: boolean;
}
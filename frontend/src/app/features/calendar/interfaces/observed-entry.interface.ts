export interface ObservedEntry {
  type:       'timeoff' | 'periodoff' | 'dayoff';
  reason:     string;
  dayKey:     string;
  startEl:    HTMLElement;
  endEl:      HTMLElement;
  startAbove: boolean;
  endAbove:   boolean;
  lastBottom: number;
}
export type TooltipType = 'timeoff' | 'periodoff' | 'dayoff';

export interface TooltipData {
  type: TooltipType;
  reason: string;
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
  date?: string; 
}

export interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  data: TooltipData | null;
}
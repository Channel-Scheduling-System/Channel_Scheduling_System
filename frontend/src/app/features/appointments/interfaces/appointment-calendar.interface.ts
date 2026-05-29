export interface AppointmentCalendarItem {
  id: number;
  startAt: string;
  endAt: string;
  status: string;
  worker: { firstName: string; lastName: string; };
  client: { firstName: string; lastName: string; };
  services: Array<{ id: number; name: string; color: string; duration: number; }>;
  notes?: string;
}

export interface PositionedChip {
  appointment: AppointmentCalendarItem;
  top: string;
  height: string;
  left: string;
  width: string;
  color: string;
  timeLabel: string;
  serviceLabel: string;
  clientLabel: string;
  notes: string;
  animName: string;
  animDuration: string;
  statusIcon: string;
  isConflict: boolean;
  zIndex: number;
  dayIndex?: number;
  isNext: boolean;
  isNextOverlap: boolean;
}

export type DayPositionedChip = PositionedChip;

export interface ChipClickPayload {
  appointment: AppointmentCalendarItem;
  anchorX: number;
  anchorY: number;
}
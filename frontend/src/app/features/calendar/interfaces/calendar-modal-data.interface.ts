import type { AvailabilityConfigData } from '../models/responses/availability-response.model';
import type { UpdateWorkingHoursRequest } from '../models/requests/update-working-hours-request.model';
import type { SetTimeOffRequest } from '../models/requests/set-time-off-request.model';
import type { SetDayOffRequest } from '../models/requests/set-day-off-request.model';
import type { SetPeriodOffRequest } from '../models/requests/set-period-off-request.model';
import type { TimeSlot } from './time-slot.interface';
export interface WorkingHoursModalData {
  availabilityData: AvailabilityConfigData;
  onSubmit: (request: UpdateWorkingHoursRequest) => void;
}
export interface TimeOffModalData {
  day?: Date;
  startSlot?: TimeSlot;
  endSlot?: TimeSlot;
  onSubmit: (request: SetTimeOffRequest) => void;
}
export interface DayOffModalData {
  day?: Date;
  onSubmit: (request: SetDayOffRequest) => void;
}
export interface PeriodOffModalData {
  startDay?: Date;
  endDay?: Date;
  onSubmit: (request: SetPeriodOffRequest) => void;
}

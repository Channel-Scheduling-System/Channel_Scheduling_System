import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from 'date-fns';
import { es } from 'date-fns/locale';
import type { TimeSlot } from '../interfaces/time-slot.interface';
import type { CalendarView } from '../types/calendar-view.types';

export function buildTimeSlots(): TimeSlot[] {
  const timeSlots: TimeSlot[] = [];
  for (let h = 5; h <= 23; h++) {
    for (const m of [0, 30]) {
      const label = `${h % 12 === 0 ? 12 : h % 12}:${m === 0 ? '00' : '30'} ${h < 12 ? 'AM' : 'PM'}`;
      timeSlots.push({ hour: h, minute: m, label });
    }
  }
  timeSlots.push({ hour: 0, minute: 0, label: '12:00 AM' });
  return timeSlots;
}

export function buildVisibleDays(currentDate: Date, currentView: CalendarView): Date[] {
  if (currentView === 'day') {
    return [currentDate];
  }

  if (currentView === 'week') {
    const start = startOfWeek(currentDate, { locale: es });
    const end = endOfWeek(currentDate, { locale: es });
    return eachDayOfInterval({ start, end });
  }

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const gridStart = startOfWeek(start, { locale: es });
  const gridEnd = endOfWeek(end, { locale: es });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

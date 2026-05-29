import {
  Directive,
  OnInit,
} from '@angular/core';
import { TimeSlot } from '../../../../interfaces/time-slot.interface';
@Directive()
export abstract class AppointmentCalendarGridBase implements OnInit {
  protected timeSlots: TimeSlot[] = [];
  public ngOnInit(): void {
    this.buildTimeSlots();
  }
  protected trackBySlot(_idx: number, slot: TimeSlot): string {
    return `${slot.hour}:${slot.minute}`;
  }
  protected trackByDay(_idx: number, day: Date): string {
    return day.toISOString();
  }
  protected isDayToday(day: Date): boolean {
    const today = new Date();
    return (
      day.getDate()     === today.getDate()     &&
      day.getMonth()    === today.getMonth()    &&
      day.getFullYear() === today.getFullYear()
    );
  }
  protected formatDayName(day: Date): string {
    return day.toLocaleDateString('es-CO', { weekday: this.weekdayFormat });
  }
  protected formatDayNumber(day: Date): string {
    return String(day.getDate());
  }
  protected get weekdayFormat(): 'long' | 'short' {
    return 'short';
  }
  protected buildTimeSlots(): void {
    this.timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (const minute of [0, 30]) {
        this.timeSlots.push({
          hour,
          minute,
          label: this.to12hLabel(hour, minute),
        });
      }
    }
  }
  protected to12hLabel(hour: number, minute: number): string {
    const h    = hour % 12 || 12;
    const mm   = minute === 0 ? '00' : '30';
    const ampm = hour < 12 ? 'am' : 'pm';
    return `${h}:${mm} ${ampm}`;
  }
}
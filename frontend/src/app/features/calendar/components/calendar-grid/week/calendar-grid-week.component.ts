import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CalendarGridBase } from '../base/calendar-grid.component';

@Component({
  selector: '[appCalendarGridWeek]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-grid-week.component.html',
})
export class CalendarGridWeekComponent extends CalendarGridBase {
  @Input() public visibleDays: Date[] = [];
}

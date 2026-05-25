import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarGridBase } from '../base/calendar-grid.component';
@Component({
  selector: '[appCalendarGridDay]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-grid-day.component.html',
})
export class CalendarGridDayComponent extends CalendarGridBase {}

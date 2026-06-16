import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentCalendarGridBase } from '../../../../appointment-calendar-grid/appointment-calendar-grid.base';
@Component({
  selector: 'app-datetime-calendar-day-grid-layer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './datetime-calendar-day-grid-layer.component.html',
  styleUrl: './datetime-calendar-day-grid-layer.component.scss',
})
export class DatetimeCalendarDayGridLayerComponent
  extends AppointmentCalendarGridBase
  implements OnInit, OnChanges
{
  @Input() public currentDate!: Date;
  public override ngOnInit(): void {
    super.ngOnInit(); 
  }
  public ngOnChanges(_changes: SimpleChanges): void {
  }
  protected override get weekdayFormat(): 'long' | 'short' {
    return 'long';
  }
}
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentCalendarGridBase } from '../../../appointment-calendar-grid/appointment-calendar-grid.base';
@Component({
  selector: 'app-appointment-calendar-week-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-calendar-week-grid.component.html',
  styleUrl: './appointment-calendar-week-grid.component.scss',
})
export class AppointmentCalendarWeekGridComponent
  extends AppointmentCalendarGridBase
  implements OnInit, OnChanges
{
  @Input() public weekStart!: Date;
  protected visibleDays: Date[] = [];
  public override ngOnInit(): void {
    super.ngOnInit(); 
    this.buildDays();
  }
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['weekStart']) {
      this.buildDays();
    }
  }
  private buildDays(): void {
    if (!this.weekStart) { return; }
    this.visibleDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }
}
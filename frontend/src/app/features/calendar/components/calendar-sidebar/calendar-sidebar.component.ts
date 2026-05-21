import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: '[appCalendarSidebar]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-sidebar.component.html',
})
export class CalendarSidebarComponent {
  @Input() public isDeleteMode = false;

  @Output() public openWorkingHoursConfig = new EventEmitter<void>();
  @Output() public openDayOffConfig = new EventEmitter<void>();
  @Output() public openTimeOffConfig = new EventEmitter<void>();
  @Output() public openPeriodOffConfig = new EventEmitter<void>();
  @Output() public toggleDeleteMode = new EventEmitter<void>();

  protected onOpenWorkingHoursConfig(): void {
    this.openWorkingHoursConfig.emit();
  }

  protected onOpenDayOffConfig(): void {
    this.openDayOffConfig.emit();
  }

  protected onOpenTimeOffConfig(): void {
    this.openTimeOffConfig.emit();
  }

  protected onOpenPeriodOffConfig(): void {
    this.openPeriodOffConfig.emit();
  }

  protected onToggleDeleteMode(): void {
    this.toggleDeleteMode.emit();
  }
}

import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarSelectionMenuService } from '../../ui/calendar-selection-menu.service';

@Component({
  selector: 'app-calendar-options-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-options-menu.component.html',
  styleUrls: ['./calendar-options-menu.component.scss'],
})
export class CalendarOptionsMenuComponent {
  private svc = inject(CalendarSelectionMenuService);

  protected visible    = computed(() => this.svc.state().visible);
  protected headerIcon = computed(() => this.svc.state().headerIcon);
  protected label      = computed(() => this.svc.state().label);
  protected actions    = computed(() => this.svc.state().actions);

  protected top = computed(() => {
    const { y } = this.svc.state();
    const estimatedH = 60 + this.actions().length * 42;
    const offset = 12;
    return y + offset + estimatedH > window.innerHeight - 8
      ? y - estimatedH - offset
      : y + offset;
  });

  protected left = computed(() => {
    const { x } = this.svc.state();
    const estimatedW = 220;
    const offset = 12;
    return x + offset + estimatedW > window.innerWidth - 8
      ? Math.max(8, x - estimatedW - offset)
      : x + offset;
  });

  protected close(): void {
    this.svc.hide();
  }

  protected run(action: () => void): void {
    action();
    this.svc.hide();
  }
}
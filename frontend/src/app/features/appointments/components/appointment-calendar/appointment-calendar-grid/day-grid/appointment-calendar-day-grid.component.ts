import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentCalendarGridBase } from '../base/appointment-calendar-grid.base';
@Component({
  selector: 'app-appointment-calendar-day-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-calendar-day-grid.component.html',
  styleUrl: './appointment-calendar-day-grid.component.scss',
})
export class AppointmentCalendarDayGridComponent
  extends AppointmentCalendarGridBase
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() public currentDate!: Date;
  @Input() public autoScrollOnInit: boolean = true;
  private readonly SLOT_H_REM = 3;
  constructor(private readonly elRef: ElementRef<HTMLElement>) {
    super();
  }
  public override ngOnInit(): void {
    super.ngOnInit(); 
  }
  public ngOnChanges(_changes: SimpleChanges): void {
  }
  public ngAfterViewInit(): void {
    if (this.autoScrollOnInit) {
      requestAnimationFrame(() => this.scrollToCurrentTime());
    }
  }
  protected override get weekdayFormat(): 'long' | 'short' {
    return 'long';
  }
  private scrollToCurrentTime(): void {
    const now     = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const scrollEl = this.findScrollParent(this.elRef.nativeElement);
    if (!scrollEl) { return; }
    const rem    = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const slotPx = this.SLOT_H_REM * rem;
    const target = Math.max(0, (minutes / 30) * slotPx - slotPx);
    scrollEl.scrollTo({ top: target, behavior: 'instant' });
  }
  private findScrollParent(el: HTMLElement): Element | null {
    let node: Element | null = el.parentElement;
    while (node && node !== document.body) {
      const { overflow, overflowY } = getComputedStyle(node);
      if (/auto|scroll/.test(overflow + overflowY)) { return node; }
      node = node.parentElement;
    }
    return document.scrollingElement;
  }
}
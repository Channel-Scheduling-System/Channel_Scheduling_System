import {
    Component, EventEmitter, Inject, InjectionToken,
    Input, OnInit, Optional, Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export const DATE_PICKER_SEED = new InjectionToken<string>('DATE_PICKER_SEED');

type ViewMode = 'calendar' | 'month' | 'year';

@Component({
    selector: 'app-date-picker',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './date-picker.component.html',
    styleUrls: ['./date-picker.component.scss'],
})
export class DatePickerComponent implements OnInit {

    @Input() public value = '';
    @Input() public label = 'Seleccionar fecha';
    @Output() public confirmed = new EventEmitter<string>();
    @Output() public cancelled = new EventEmitter<void>();

    protected viewYear!: number;
    protected viewMonth!: number;
    protected selectedYear!: number;
    protected selectedMonth!: number;
    protected selectedDay!: number;
    protected viewMode: ViewMode = 'calendar';
    protected yearRangeStart = 0;

    readonly WEEKDAYS     = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    readonly MONTHS_FULL  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                             'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    readonly MONTHS_SHORT = ['Ene','Feb','Mar','Abr','May','Jun',
                             'Jul','Ago','Sep','Oct','Nov','Dic'];

    readonly currentYear  = new Date().getFullYear();
    readonly currentMonth = new Date().getMonth();

    constructor(@Optional() @Inject(DATE_PICKER_SEED) private readonly _seed: string | null) {
        this._initFromToday();
        if (this._seed) this.seedFromValue(this._seed);
    }

    public ngOnInit(): void {
        if (!this._seed) this.seedFromValue(this.value);
    }

    private _initFromToday(): void {
        const now = new Date();
        this.viewYear = this.selectedYear = now.getFullYear();
        this.viewMonth = this.selectedMonth = now.getMonth();
        this.selectedDay = now.getDate();
        this._syncYearRange();
    }

    public seedFromValue(raw: string): void {
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw ?? '')) {
            const [y, m, d] = raw.split('-').map(Number);
            this.selectedYear  = this.viewYear  = y;
            this.selectedMonth = this.viewMonth = m - 1;
            this.selectedDay   = d;
        } else {
            this._initFromToday();
        }
        this._syncYearRange();
    }

    private _syncYearRange(): void {
        this.yearRangeStart = this.viewYear - 5;
    }

    

    protected get calendarDays(): (number | null)[] {
        const firstDow    = new Date(this.viewYear, this.viewMonth, 1).getDay();
        const startOffset = (firstDow + 6) % 7;
        const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
        const days: (number | null)[] = [];
        for (let i = 0; i < startOffset; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(d);
        while (days.length % 7 !== 0) days.push(null);
        return days;
    }

    protected get yearRange(): number[] {
        return Array.from({ length: 12 }, (_, i) => this.yearRangeStart + i);
    }

    

    protected get navTitle(): string {
        if (this.viewMode === 'calendar') return `${this.MONTHS_FULL[this.viewMonth]} ${this.viewYear}`;
        if (this.viewMode === 'month')   return String(this.viewYear);
        return `${this.yearRangeStart} – ${this.yearRangeStart + 11}`;
    }

    protected toggleMode(): void {
        if (this.viewMode === 'calendar') { this.viewMode = 'month'; }
        else if (this.viewMode === 'month') { this._syncYearRange(); this.viewMode = 'year'; }
        else { this.viewMode = 'calendar'; }
    }

    protected prevNav(): void {
        if (this.viewMode === 'calendar') this._shiftMonth(-1);
        else if (this.viewMode === 'month') this.viewYear--;
        else this.yearRangeStart -= 12;
    }

    protected nextNav(): void {
        if (this.viewMode === 'calendar') this._shiftMonth(1);
        else if (this.viewMode === 'month') this.viewYear++;
        else this.yearRangeStart += 12;
    }

    private _shiftMonth(delta: -1 | 1): void {
        this.viewMonth += delta;
        if (this.viewMonth < 0)  { this.viewMonth = 11; this.viewYear--; }
        if (this.viewMonth > 11) { this.viewMonth = 0;  this.viewYear++; }
    }

    protected pickDay(day: number | null): void {
        if (!day) return;
        this.selectedDay = day; this.selectedMonth = this.viewMonth; this.selectedYear = this.viewYear;
    }

    protected pickMonth(m: number): void { this.viewMonth = m; this.viewMode = 'calendar'; }

    protected pickYear(y: number): void { this.viewYear = y; this.viewMode = 'month'; }

    protected isSelected(day: number): boolean {
        return day === this.selectedDay && this.viewMonth === this.selectedMonth && this.viewYear === this.selectedYear;
    }

    protected isToday(day: number): boolean {
        const n = new Date();
        return day === n.getDate() && this.viewMonth === n.getMonth() && this.viewYear === n.getFullYear();
    }

    protected get displayValue(): string {
        return `${this.selectedDay} ${this.MONTHS_SHORT[this.selectedMonth]} ${this.selectedYear}`;
    }

    

    protected onConfirm(): void {
        const y = String(this.selectedYear);
        const m = String(this.selectedMonth + 1).padStart(2, '0');
        const d = String(this.selectedDay).padStart(2, '0');
        this.confirmed.emit(`${y}-${m}-${d}`);
    }

    protected onCancel(): void { this.cancelled.emit(); }
}
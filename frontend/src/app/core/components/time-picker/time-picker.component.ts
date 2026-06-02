import {
    Component,
    EventEmitter,
    Inject,
    InjectionToken,
    Input,
    OnChanges,
    OnInit,
    Optional,
    Output,
    SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
export const TIME_PICKER_SEED = new InjectionToken<string>('TIME_PICKER_SEED');
@Component({
    selector: 'app-time-picker',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './time-picker.component.html',
    styleUrls: ['./time-picker.component.scss'],
})
export class TimePickerComponent implements OnInit, OnChanges {
    @Input() public value = '';
    @Input() public label = 'Seleccionar hora';
    @Output() public confirmed = new EventEmitter<string>();
    @Output() public cancelled = new EventEmitter<void>();
    public hour: number = 12;
    public minute: number = 0;
    public period: 'AM' | 'PM' = 'AM';
    constructor(@Optional() @Inject(TIME_PICKER_SEED) private readonly _seed: string | null) {
        if (this._seed) this.seedFromValue(this._seed);
    }
    readonly HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    readonly MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    public ngOnInit(): void {
        if (!this._seed) this.seedFromValue(this.value);
    }
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['value']) {
            this.seedFromValue(changes['value'].currentValue);
        }
    }
    public seedFromValue(raw: string): void {
        if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(raw ?? '')) {
            const [h, m] = raw.split(':').map(Number);
            this.period = h >= 12 ? 'PM' : 'AM';
            this.hour = h % 12 || 12;
            this.minute = m;
        } else {
            this.hour = 12; this.minute = 0; this.period = 'AM';
        }
    }
    protected pickHour(h: number): void {
        this.hour = h;
    }
    protected pickMinute(m: number): void {
        this.minute = m;
    }
    protected pickPeriod(p: 'AM' | 'PM'): void {
        this.period = p;
    }
    protected get displayValue(): string {
        return `${String(this.hour).padStart(2, '0')}:${String(this.minute).padStart(2, '0')} ${this.period}`;
    }
    protected onConfirm(): void {
        let h = this.hour % 12;
        if (this.period === 'PM') h += 12;
        const val = `${String(h).padStart(2, '0')}:${String(this.minute).padStart(2, '0')}`;
        this.confirmed.emit(val);
    }
    protected onCancel(): void {
        this.cancelled.emit();
    }
}
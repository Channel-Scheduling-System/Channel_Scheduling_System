import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarTooltipService } from '../../ui/calendar-tooltip.service';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatTimeTo12Hour } from '../../utils/time.util';
@Component({
    selector: 'app-calendar-tooltip',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './calendar-tooltip.component.html',
    styleUrls: ['./calendar-tooltip.component.scss'],
})
export class CalendarTooltipComponent {
    private svc = inject(CalendarTooltipService);
    protected visible = computed(() => this.svc.state().visible);
    protected data = computed(() => this.svc.state().data);
    protected top = computed(() => {
        const { y } = this.svc.state();
        const estimatedH = 110;
        const offset = 10;
        const cursorH = 16;
        const wouldOverflowBottom = y + cursorH + offset + estimatedH > window.innerHeight - 8;
        return wouldOverflowBottom
            ? y - estimatedH - offset
            : y + cursorH + offset;
    });
    protected left = computed(() => {
        const { x } = this.svc.state();
        const offset = 10;
        const estimatedW = 232;
        const wouldOverflowRight = x + offset + estimatedW > window.innerWidth - 8;
        return wouldOverflowRight
            ? Math.max(8, x - estimatedW - offset)
            : x + offset;
    });
    protected icon = computed(() => {
        switch (this.data()?.type) {
            case 'timeoff': return 'lock_clock';
            case 'periodoff': return 'beach_access';
            case 'dayoff': return 'event_busy';
            default: return 'info';
        }
    });
    protected typeLabel = computed(() => {
        switch (this.data()?.type) {
            case 'timeoff': return 'Bloqueo de tiempo';
            case 'periodoff': return 'Periodo libre';
            case 'dayoff': return 'Día libre';
            default: return '';
        }
    });
    protected rangeText = computed(() => {
        const d = this.data();
        if (!d) return '';
        if (d.type === 'timeoff' && d.startTime && d.endTime) {
            const start12h = formatTimeTo12Hour(d.startTime);
            const end12h = formatTimeTo12Hour(d.endTime);
            return `${start12h} — ${end12h}`;
        }
        if (d.type === 'periodoff' && d.startDate && d.endDate) {
            const s = parseISO(d.startDate);
            const e = parseISO(d.endDate);
            if (s.getFullYear() === e.getFullYear()) {
                return `${format(s, "d MMM", { locale: es })} — ${format(e, "d 'de' MMM yyyy", { locale: es })}`;
            }
            return `${format(s, "d MMM yyyy", { locale: es })} — ${format(e, "d MMM yyyy", { locale: es })}`;
        }
        if (d.type === 'dayoff' && d.date) {
            return format(parseISO(d.date), "EEEE, d 'de' MMMM yyyy", { locale: es });
        }
        return '';
    });
}
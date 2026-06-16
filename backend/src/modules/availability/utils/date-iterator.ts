import { Temporal } from 'temporal-polyfill';

export class DateIterator {
    static forEach(
        startDate: string,
        endDate: string,
        callback: (date: string, dayOfWeek: number) => void,
    ): void {
        const start = Temporal.PlainDate.from(startDate);
        const end = Temporal.PlainDate.from(endDate);
        let current = start;
        while (
            current.year < end.year ||
            (current.year === end.year && current.month < end.month) ||
            (current.year === end.year &&
                current.month === end.month &&
                current.day <= end.day)
        ) {
            callback(current.toString(), current.dayOfWeek);
            current = current.add({ days: 1 });
        }
    }

    static generate(
        startDate: string,
        endDate: string,
    ): Array<{ date: string; dayOfWeek: number }> {
        const dates: Array<{ date: string; dayOfWeek: number }> = [];
        this.forEach(startDate, endDate, (date, dayOfWeek) => {
            dates.push({ date, dayOfWeek });
        });
        return dates;
    }
}

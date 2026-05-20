import { Temporal } from 'temporal-polyfill';
import { DateRange, ViewType } from '../availability.types.js';

export class DateRangeCalculator {
    calculate(view: ViewType, date: string): DateRange {
        const referenceDate = Temporal.PlainDate.from(date);

        switch (view) {
            case 'DAY':
                return {
                    startDate: date,
                    endDate: date,
                };
            case 'WEEK': {
                const dayOfWeek = referenceDate.dayOfWeek;
                const daysToMonday = dayOfWeek === 1 ? 0 : dayOfWeek - 1;
                const mondayOfWeek = referenceDate.subtract({
                    days: daysToMonday,
                });
                const sundayOfWeek = mondayOfWeek.add({ days: 6 });
                return {
                    startDate: mondayOfWeek.toString(),
                    endDate: sundayOfWeek.toString(),
                };
            }
            case 'MONTH': {
                const firstDayOfMonth = referenceDate.with({
                    day: 1,
                });
                const lastDayOfMonth = firstDayOfMonth
                    .with({
                        month: firstDayOfMonth.month + 1,
                        day: 1,
                    })
                    .subtract({ days: 1 });
                return {
                    startDate: firstDayOfMonth.toString(),
                    endDate: lastDayOfMonth.toString(),
                };
            }
        }
    }
}

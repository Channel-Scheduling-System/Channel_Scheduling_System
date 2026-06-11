import { Temporal } from 'temporal-polyfill';

export type ViewType = 'DAY' | 'WEEK' | 'MONTH';

export interface DateRange {
    startDate: string; // ISO date string
    endDate: string; // ISO date string
}

export function calculateDataRange(view: ViewType, date: string): DateRange {
    const referenceDate = Temporal.PlainDate.from(date);

    switch (view) {
        case 'DAY':
            return {
                startDate: date,
                endDate: date,
            };
        case 'WEEK': {
            const daysSinceMonday = referenceDate.dayOfWeek - 1;
            const mondayOfWeek = referenceDate.subtract({
                days: daysSinceMonday,
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
                .add({ months: 1 })
                .subtract({ days: 1 });
            return {
                startDate: firstDayOfMonth.toString(),
                endDate: lastDayOfMonth.toString(),
            };
        }
        default: {
            const exhaustiveCheck: never = view;
            throw new Error(`Unsupported view type: ${exhaustiveCheck}`);
        }
    }
}

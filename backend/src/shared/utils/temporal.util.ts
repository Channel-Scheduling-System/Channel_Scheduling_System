import { Temporal } from 'temporal-polyfill';

function normalizeDateInput(date: string): string {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00Z` : date;
}

export function isFutureDate(date: string): boolean {
    const dateInstant = Temporal.Instant.from(normalizeDateInput(date));
    const now = Temporal.Now.instant();
    return Temporal.Instant.compare(dateInstant, now) > 0;
}

export function dateToInstant(date: Date | string): Temporal.Instant {
    if (date instanceof Date) {
        return Temporal.Instant.from(date.toISOString());
    }
    return Temporal.Instant.from(normalizeDateInput(date));
}
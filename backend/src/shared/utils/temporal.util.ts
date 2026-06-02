import { Temporal } from 'temporal-polyfill';

function normalizeDateInput(date: string): string {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00Z` : date;
}

export function isFutureDate(date: string): boolean {
    const normalizedDate = normalizeDateInput(date);
    const localDateTime = Temporal.PlainDateTime.from(normalizedDate.replace('Z', ''));
    const instant = localDateTime.toZonedDateTime('America/Bogota').toInstant();
    const now = Temporal.Now.zonedDateTimeISO('America/Bogota').toInstant();
    return Temporal.Instant.compare(instant, now) > 0;
}

export function dateToInstant(date: Date | string): Temporal.Instant {
    if (date instanceof Date) {
        return Temporal.Instant.from(date.toISOString());
    }
    return Temporal.Instant.from(normalizeDateInput(date));
}
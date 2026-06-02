import { Temporal } from 'temporal-polyfill';

export function isFutureDate(date: string): boolean {
    const dateInstant = Temporal.Instant.from(date);
    const now = Temporal.Now.instant();
    return Temporal.Instant.compare(dateInstant, now) > 0;
}

export function dateToInstant(date: Date | string): Temporal.Instant {
    if (date instanceof Date) {
        return Temporal.Instant.from(date.toISOString());
    }
    return Temporal.Instant.from(date);
}